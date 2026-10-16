// server/config/db.js
const path = require('path');
const mongoose = require('mongoose');

// Ensure .env is always loaded from server/.env regardless of process.cwd()
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const fs = require('fs');

function maskMongoUri(uri) {
  if (!uri) return '<undefined>';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
}

function parseServerErrors(err) {
  const diagnostics = [];
  if (err.reason && err.reason.servers) {
    for (const [address, serverDesc] of err.reason.servers.entries()) {
      const errDetail = serverDesc.error ? serverDesc.error.message : 'no error details';
      diagnostics.push({
        address,
        type: serverDesc.type,
        error: errDetail,
      });
    }
  }
  return diagnostics;
}

function checkIsTlsVerificationError(err) {
  const tlsKeywords = [
    'unable to verify the first certificate',
    'self signed certificate',
    'certificate has expired',
    'depth_zero_self_signed_cert',
    'unable_to_verify_leaf_signature',
    'cert_has_expired',
    'client network socket disconnected before secure tls connection was established',
    'tls',
  ];

  const matchesKeyword = (msg) => {
    if (!msg || typeof msg !== 'string') return false;
    const lower = msg.toLowerCase();
    return tlsKeywords.some((kw) => lower.includes(kw));
  };

  if (matchesKeyword(err.message)) return true;

  if (err.reason && err.reason.servers) {
    for (const serverDesc of err.reason.servers.values()) {
      if (serverDesc.error && matchesKeyword(serverDesc.error.message)) {
        return true;
      }
    }
  }
  return false;
}

async function connectDB(customUri) {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_sense';
  const isProduction = process.env.NODE_ENV === 'production';
  const masked = maskMongoUri(uri);

  console.log(`🔌 Connecting to MongoDB: ${masked}`);

  // Base connection options
  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  };

  // CA file support for custom/enterprise CAs (keeps strict certificate validation active)
  if (process.env.MONGODB_TLS_CA_FILE) {
    const caPath = path.resolve(process.env.MONGODB_TLS_CA_FILE);
    if (fs.existsSync(caPath)) {
      options.tlsCAFile = caPath;
      console.log(`🔒 Using custom TLS CA certificate for strict verification: ${path.basename(caPath)}`);
    } else {
      console.warn(`⚠️ Specified MONGODB_TLS_CA_FILE does not exist at: ${caPath}`);
    }
  }

  // Strictly enforce that tlsAllowInvalidCertificates is impossible in production
  if (isProduction) {
    if (process.env.MONGODB_TLS_ALLOW_INVALID === 'true') {
      console.warn('⚠️ [SECURITY] MONGODB_TLS_ALLOW_INVALID is strictly ignored in production. Certificate verification remains enforced.');
    }
  } else {
    // Development-only override if explicitly enabled in local environment
    if (process.env.MONGODB_TLS_ALLOW_INVALID === 'true') {
      options.tlsAllowInvalidCertificates = true;
      console.warn('⚡ [DEV ONLY] Insecure TLS certificate verification bypass active (MONGODB_TLS_ALLOW_INVALID=true).');
    }
  }

  try {
    await mongoose.connect(uri, options);
    return mongoose.connection;
  } catch (err) {
    const isTlsError = checkIsTlsVerificationError(err);
    const serverDetails = parseServerErrors(err);

    console.error('\n❌ MongoDB Connection Failure:');
    console.error(`   Error: ${err.name} - ${err.message}`);
    if (serverDetails.length > 0) {
      console.error('   Underlying Server Status:');
      serverDetails.forEach((s) => {
        console.error(`     • ${s.address} (${s.type}): ${s.error}`);
      });
    }

    if (isTlsError) {
      console.error('\n⚠️  TLS Certificate Verification / Handshake Error detected!');
      console.error('   Common Cause: Local antivirus (e.g. Avast Web/Mail Shield, Kaspersky) or proxy');
      console.error('   intercepting port 27017, OR MongoDB Atlas IP access list rejecting connection before TLS completion.');

      if (!isProduction) {
        console.warn('\n⚡ [DEV RESILIENCE] Retrying connection with tlsAllowInvalidCertificates for local development...');
        try {
          await mongoose.connect(uri, {
            ...options,
            tlsAllowInvalidCertificates: true,
          });
          console.log('✅ Connected to MongoDB Atlas with local TLS compatibility fallback.');
          return mongoose.connection;
        } catch (retryErr) {
          console.error('❌ Retry failed:', retryErr.message);
          throw retryErr;
        }
      } else {
        console.error('⛔ Strict TLS validation is enforced in production. Aborting connection to prevent man-in-the-middle attacks.');
        console.error('   Production clusters must use trusted CAs (e.g. Let\'s Encrypt / DigiCert included in Node.js) or configure MONGODB_TLS_CA_FILE.');
        throw err;
      }
    }

    throw err;
  }
}

// Global Connection Listeners
mongoose.connection.on('connected', () => {
  console.log(`✅ MongoDB connected successfully [Database: ${mongoose.connection.name || 'default'}, Host: ${mongoose.connection.host || 'unknown'}]`);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('ℹ️ MongoDB disconnected');
});

module.exports = { connectDB, maskMongoUri };
