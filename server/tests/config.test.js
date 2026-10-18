const test = require('node:test');
const assert = require('node:assert');
const { getJwtSecret, getAllowedOrigins } = require('../config');

function withEnv(vars, fn) {
  const saved = {};
  for (const k of Object.keys(vars)) saved[k] = process.env[k];
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
  try { return fn(); } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
  }
}

test('getJwtSecret throws when JWT_SECRET is missing or blank', () => {
  withEnv({ JWT_SECRET: undefined }, () => assert.throws(() => getJwtSecret(), /JWT_SECRET/));
  withEnv({ JWT_SECRET: '   ' }, () => assert.throws(() => getJwtSecret(), /JWT_SECRET/));
});

test('getJwtSecret returns the configured secret', () => {
  withEnv({ JWT_SECRET: 's3cret' }, () => assert.strictEqual(getJwtSecret(), 's3cret'));
});

test('getAllowedOrigins allows any origin only when CLIENT_URL is unset', () => {
  withEnv({ CLIENT_URL: undefined }, () => assert.strictEqual(getAllowedOrigins(), true));
});

test('getAllowedOrigins parses a comma-separated list and trims slashes', () => {
  withEnv({ CLIENT_URL: 'https://a.com/, http://localhost:3000' }, () =>
    assert.deepStrictEqual(getAllowedOrigins(), ['https://a.com', 'http://localhost:3000'])
  );
});
