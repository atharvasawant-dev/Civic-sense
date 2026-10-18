process.env.JWT_SECRET = 'test-secret';

const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const { verifyToken, verifyAdmin, verifyUser } = require('../middleware/roleMiddleware');

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

const tokenFor = (role, secret = 'test-secret') => jwt.sign({ id: 'u1', role }, secret);

function run(mw, authHeader) {
  const req = { headers: authHeader ? { authorization: authHeader } : {} };
  const res = mockRes();
  let nextCalled = false;
  mw(req, res, () => { nextCalled = true; });
  return { req, res, nextCalled };
}

test('rejects requests without a token', () => {
  const { res, nextCalled } = run(verifyToken);
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
});

test('rejects a token signed with the wrong secret (old default no longer works)', () => {
  const { res, nextCalled } = run(verifyToken, `Bearer ${tokenFor('admin', 'your_jwt_secret')}`);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(nextCalled, false);
});

test('accepts a valid token and sets req.user', () => {
  const { req, nextCalled } = run(verifyToken, `Bearer ${tokenFor('user')}`);
  assert.strictEqual(nextCalled, true);
  assert.deepStrictEqual(req.user, { id: 'u1', role: 'user' });
});

test('verifyAdmin only lets admins through', () => {
  assert.strictEqual(run(verifyAdmin, `Bearer ${tokenFor('admin')}`).nextCalled, true);
  const denied = run(verifyAdmin, `Bearer ${tokenFor('user')}`);
  assert.strictEqual(denied.nextCalled, false);
  assert.strictEqual(denied.res.statusCode, 403);
});

test('verifyUser only lets regular users through', () => {
  assert.strictEqual(run(verifyUser, `Bearer ${tokenFor('user')}`).nextCalled, true);
  assert.strictEqual(run(verifyUser, `Bearer ${tokenFor('admin')}`).nextCalled, false);
});
