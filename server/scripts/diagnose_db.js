// server/scripts/diagnose_db.js
// Safe diagnostic script for MongoDB Atlas connection
// Never logs passwords, usernames, or unredacted connection strings.

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const dns = require('dns').promises;
const tls = require('tls');
const net = require('net');
const mongoose = require('mongoose');

function maskUri(uri) {
  if (!uri) return '<undefined>';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
}

async function runDiagnostics() {
  console.log('🔍 ====== MONGO CONNECTION DIAGNOSTIC ======');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Node version:', process.version);
  console.log('Mongoose version:', mongoose.version);

  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    console.error('❌ FATAL: process.env.MONGODB_URI is not set in server/.env!');
    process.exit(1);
  }

  console.log('Masked URI:', maskUri(rawUri));

  // 1. Parse URI components safely
  let parsed;
  try {
    // Replace mongodb+srv with https just for URL parsing if needed, or parse directly
    const urlForParsing = rawUri.startsWith('mongodb+srv://')
      ? rawUri.replace('mongodb+srv://', 'https://')
      : rawUri.replace('mongodb://', 'http://');
    parsed = new URL(urlForParsing);
    console.log('Protocol:', rawUri.startsWith('mongodb+srv://') ? 'mongodb+srv' : 'mongodb');
    console.log('Host:', parsed.hostname);
    console.log('Database Path:', parsed.pathname);
    console.log('Search Params:', parsed.search);
    console.log('Has Username:', Boolean(parsed.username));
    console.log('Password Length:', parsed.password ? parsed.password.length : 0);
  } catch (err) {
    console.error('❌ Failed to parse URI structure:', err.message);
  }

  // 2. DNS Lookups
  if (rawUri.startsWith('mongodb+srv://') && parsed) {
    const srvTarget = `_mongodb._tcp.${parsed.hostname}`;
    console.log('\n📡 --- DNS SRV Resolution ---');
    console.log('Querying SRV:', srvTarget);
    let srvRecords = [];
    try {
      srvRecords = await dns.resolveSrv(srvTarget);
      console.log(`✅ SRV resolved ${srvRecords.length} host(s):`);
      for (const rec of srvRecords) {
        console.log(`   - ${rec.name}:${rec.port} (priority: ${rec.priority}, weight: ${rec.weight})`);
      }
    } catch (dnsErr) {
      console.error('❌ SRV resolution failed:', dnsErr.code, dnsErr.message);
    }

    // TXT record for options (replicaSet, authSource)
    try {
      const txtRecords = await dns.resolveTxt(parsed.hostname);
      console.log('✅ TXT options record:', txtRecords.map(r => r.join('')).join(' '));
    } catch (txtErr) {
      console.log('ℹ️ No TXT records found or error:', txtErr.code);
    }

    // Test TCP and TLS to each resolved host
    console.log('\n🔒 --- Direct TCP & TLS Handshake Checks ---');
    for (const rec of srvRecords) {
      const host = rec.name;
      const port = rec.port || 27017;
      
      // TCP check
      const tcpResult = await new Promise((resolve) => {
        const sock = new net.Socket();
        sock.setTimeout(3000);
        sock.on('connect', () => {
          sock.destroy();
          resolve({ ok: true });
        });
        sock.on('timeout', () => {
          sock.destroy();
          resolve({ ok: false, error: 'TIMEOUT' });
        });
        sock.on('error', (e) => {
          resolve({ ok: false, error: e.code || e.message });
        });
        sock.connect(port, host);
      });
      console.log(`   TCP ${host}:${port} ->`, tcpResult.ok ? '✅ Connected' : `❌ Failed (${tcpResult.error})`);

      // TLS check
      const tlsResult = await new Promise((resolve) => {
        const tlsSock = tls.connect({
          host,
          port,
          servername: host,
          timeout: 4000,
          rejectUnauthorized: true,
        }, () => {
          const cert = tlsSock.getPeerCertificate();
          const authorized = tlsSock.authorized;
          tlsSock.end();
          resolve({ ok: true, authorized, subject: cert?.subject?.CN, issuer: cert?.issuer?.O });
        });
        tlsSock.on('timeout', () => {
          tlsSock.destroy();
          resolve({ ok: false, error: 'TIMEOUT' });
        });
        tlsSock.on('error', (e) => {
          resolve({ ok: false, error: `${e.name}: ${e.message}`, code: e.code });
        });
      });
      console.log(`   TLS ${host}:${port} ->`, tlsResult.ok ? `✅ Handshake OK (authorized: ${tlsResult.authorized}, Subject: ${tlsResult.subject})` : `❌ TLS Error: ${tlsResult.error}`);
    }
  }

  // 3. Mongoose Connection with detailed listeners
  console.log('\n🍃 --- Mongoose Connection Attempt (serverSelectionTimeoutMS: 5000) ---');
  
  mongoose.connection.on('connecting', () => console.log('🔄 Mongoose event: connecting...'));
  mongoose.connection.on('connected', () => console.log('✅ Mongoose event: connected!'));
  mongoose.connection.on('open', () => console.log('🔓 Mongoose event: open!'));
  mongoose.connection.on('error', (e) => console.log('❌ Mongoose event: error ->', e.name, e.message));
  mongoose.connection.on('disconnected', () => console.log('ℹ️ Mongoose event: disconnected'));

  try {
    await mongoose.connect(rawUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log('🎉 SUCCESS: Mongoose connected to Atlas successfully!');
    console.log('ReadyState:', mongoose.connection.readyState);
    console.log('Database Name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    await mongoose.disconnect();
  } catch (mongoErr) {
    console.error('\n❌ Mongoose Connection Failed!');
    console.error('Error Name:', mongoErr.name);
    console.error('Error Message:', mongoErr.message);

    if (mongoErr.reason) {
      console.error('\n🔍 --- Server Selection Error Reason Details ---');
      console.error('Topology Type:', mongoErr.reason.type);
      console.error('ReplicaSet Name:', mongoErr.reason.setName || '<none>');
      if (mongoErr.reason.servers) {
        console.error(`Discovered Servers (${mongoErr.reason.servers.size}):`);
        for (const [address, serverDesc] of mongoErr.reason.servers.entries()) {
          console.error(`\n   Server: ${address}`);
          console.error(`   Type: ${serverDesc.type}`);
          console.error(`   Wire Version: ${serverDesc.minWireVersion} - ${serverDesc.maxWireVersion}`);
          console.error(`   RoundTripTime: ${serverDesc.roundTripTime}`);
          if (serverDesc.error) {
            console.error(`   🔥 Underlying Server Error:`);
            console.error(`      Name:    ${serverDesc.error.name}`);
            console.error(`      Message: ${serverDesc.error.message}`);
            console.error(`      Code:    ${serverDesc.error.code}`);
            if (serverDesc.error.cause) {
              console.error(`      Cause:   ${serverDesc.error.cause.message || serverDesc.error.cause}`);
            }
          } else {
            console.error(`   No specific server error recorded (description may be unknown)`);
          }
        }
      }
    }
  }

  console.log('\n🏁 Diagnostic completed.');
  process.exit(0);
}

runDiagnostics().catch(err => {
  console.error('Fatal unhandled in diagnostic:', err);
  process.exit(1);
});
