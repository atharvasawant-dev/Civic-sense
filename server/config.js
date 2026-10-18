// Central place for environment-driven configuration.

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error(
      'JWT_SECRET is not set. Add a long random value to server/.env before starting the server.'
    );
  }
  return secret;
}

// Comma-separated list of allowed browser origins, e.g.
// CLIENT_URL=https://my-app.onrender.com,http://localhost:3000
// Returns `true` (allow any origin) only when CLIENT_URL is not configured.
function getAllowedOrigins() {
  const raw = process.env.CLIENT_URL;
  if (!raw || !raw.trim()) return true;
  return raw.split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean);
}

module.exports = { getJwtSecret, getAllowedOrigins };
