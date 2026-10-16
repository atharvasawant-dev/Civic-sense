// server/tests/server.test.js
// Set test database BEFORE importing app
if (process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: Cannot run tests in production!');
}
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/civic_sense_test';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { getJwtSecret } = require('../config/jwt');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  // Clean test database collections
  await Promise.all([
    User.deleteMany({ email: /@civicsense\.test$/ }),
    Issue.deleteMany({ landmark: 'TEST_LOCATION' }),
    Notification.deleteMany({ message: /TEST_/ }),
  ]);
});

after(async () => {
  // Cleanup test database
  await Promise.all([
    User.deleteMany({ email: /@civicsense\.test$/ }),
    Issue.deleteMany({ landmark: 'TEST_LOCATION' }),
    Notification.deleteMany({ message: /TEST_/ }),
  ]);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
});

describe('Civic Sense Platform Tests', () => {
  test('GET / returns 200 and health message', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('Civic Sense backend is running'));
  });

  test('GET /api/stats returns stats aggregates', async () => {
    const res = await fetch(`${baseUrl}/api/stats`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(typeof data.totalIssues === 'number');
    assert.ok(typeof data.resolvedIssues === 'number');
    assert.ok(typeof data.activeUsers === 'number');
  });

  test('Security: Unauthenticated mutations are blocked', async () => {
    const resPut = await fetch(`${baseUrl}/api/issues/507f1f77bcf86cd799439011/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Resolved' }),
    });
    assert.strictEqual(resPut.status, 401);

    const resDel = await fetch(`${baseUrl}/api/issues/507f1f77bcf86cd799439011`, {
      method: 'DELETE',
    });
    assert.strictEqual(resDel.status, 401);

    const resVote = await fetch(`${baseUrl}/api/issues/507f1f77bcf86cd799439011/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 1 }),
    });
    assert.strictEqual(resVote.status, 401);
  });

  test('Security: Admin routes reject requests without admin token', async () => {
    const res = await fetch(`${baseUrl}/api/admin/issues`);
    assert.strictEqual(res.status, 401);

    const userToken = jwt.sign({ id: 'dummy_user_id', role: 'user' }, getJwtSecret());
    const resForbidden = await fetch(`${baseUrl}/api/admin/issues`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(resForbidden.status, 403);
  });

  test('Auth: Register, login, and user profile flow', async () => {
    const testEmail = `citizen_${Date.now()}@civicsense.test`;

    // 1. Register
    const resReg = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Citizen',
        email: testEmail,
        password: 'password123',
      }),
    });
    assert.strictEqual(resReg.status, 201);
    const dataReg = await resReg.json();
    assert.ok(dataReg.user);
    assert.strictEqual(dataReg.user.name, 'Jane Citizen');
    assert.strictEqual(dataReg.user.role, 'user');

    // 2. Login
    const resLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'password123' }),
    });
    assert.strictEqual(resLogin.status, 200);
    const dataLogin = await resLogin.json();
    assert.ok(dataLogin.token);
    const token = dataLogin.token;

    // 3. Profile view
    const resProf = await fetch(`${baseUrl}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(resProf.status, 200);
    const dataProf = await resProf.json();
    assert.strictEqual(dataProf.user.email, testEmail);
    assert.ok(typeof dataProf.stats.totalKarma === 'number');

    // 4. Update profile
    const resUpdateProf = await fetch(`${baseUrl}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bio: 'Active civic participant', pincode: '400001' }),
    });
    assert.strictEqual(resUpdateProf.status, 200);
    const dataUpdateProf = await resUpdateProf.json();
    assert.strictEqual(dataUpdateProf.user.bio, 'Active civic participant');
  });

  test('Reddit Feed: Report issue, Upvote/Downvote, and Comment flow', async () => {
    // Create citizen user
    const authorEmail = `author_${Date.now()}@civicsense.test`;
    const voterEmail = `voter_${Date.now()}@civicsense.test`;

    const regAuthor = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Author', email: authorEmail, password: 'password123' }),
    });
    const { user: authorUser } = await regAuthor.json();
    const authorToken = jwt.sign({ id: authorUser.id, role: 'user' }, getJwtSecret());

    const regVoter = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Voter User', email: voterEmail, password: 'password123' }),
    });
    const { user: voterUser } = await regVoter.json();
    const voterToken = jwt.sign({ id: voterUser.id, role: 'user' }, getJwtSecret());

    // 1. Author submits an issue
    const resCreate = await fetch(`${baseUrl}/api/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authorToken}`,
      },
      body: JSON.stringify({
        title: 'TEST_ Huge Pothole on Main Road',
        description: 'Dangerous pothole damaging vehicles',
        category: 'Pothole',
        landmark: 'TEST_LOCATION',
        pincode: '400001',
      }),
    });
    assert.strictEqual(resCreate.status, 201);
    const createdData = await resCreate.json();
    const issueId = createdData.issue._id;
    assert.strictEqual(createdData.issue.score, 0);

    // 2. Voter upvotes (+1)
    const resVote1 = await fetch(`${baseUrl}/api/issues/${issueId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${voterToken}`,
      },
      body: JSON.stringify({ value: 1 }),
    });
    assert.strictEqual(resVote1.status, 200);
    const voteData1 = await resVote1.json();
    assert.strictEqual(voteData1.score, 1);
    assert.strictEqual(voteData1.userVote, 1);

    // 3. Verify author received notification for upvote
    const resNotif = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    assert.strictEqual(resNotif.status, 200);
    const notifData = await resNotif.json();
    assert.ok(notifData.notifications.length > 0);
    assert.strictEqual(notifData.unreadCount, 1);

    // 4. Voter toggles vote off (clicks upvote again -> 0)
    const resVoteToggle = await fetch(`${baseUrl}/api/issues/${issueId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${voterToken}`,
      },
      body: JSON.stringify({ value: 1 }),
    });
    assert.strictEqual(resVoteToggle.status, 200);
    const voteToggleData = await resVoteToggle.json();
    assert.strictEqual(voteToggleData.score, 0);
    assert.strictEqual(voteToggleData.userVote, 0);

    // 5. Voter downvotes (-1)
    const resDownvote = await fetch(`${baseUrl}/api/issues/${issueId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${voterToken}`,
      },
      body: JSON.stringify({ value: -1 }),
    });
    assert.strictEqual(resDownvote.status, 200);
    const downvoteData = await resDownvote.json();
    assert.strictEqual(downvoteData.score, -1);
    assert.strictEqual(downvoteData.userVote, -1);

    // 6. Voter posts a comment
    const resComment = await fetch(`${baseUrl}/api/issues/${issueId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${voterToken}`,
      },
      body: JSON.stringify({ content: 'I witnessed this earlier today, please fix promptly.' }),
    });
    assert.strictEqual(resComment.status, 201);
    const commentData = await resComment.json();
    assert.strictEqual(commentData.content, 'I witnessed this earlier today, please fix promptly.');
    assert.strictEqual(commentData.user.name, 'Voter User');

    // 7. Verify comments list
    const resCommentList = await fetch(`${baseUrl}/api/issues/${issueId}/comments`);
    assert.strictEqual(resCommentList.status, 200);
    const commentList = await resCommentList.json();
    assert.strictEqual(commentList.length, 1);

    // 8. Feed query with sort and filter
    const resFeed = await fetch(`${baseUrl}/api/issues?category=Pothole&sort=latest`, {
      headers: { Authorization: `Bearer ${voterToken}` },
    });
    assert.strictEqual(resFeed.status, 200);
    const feedData = await resFeed.json();
    assert.ok(Array.isArray(feedData.issues));
    const found = feedData.issues.find((i) => String(i._id) === String(issueId));
    assert.ok(found);
    assert.strictEqual(found.commentsCount, 1);
    assert.strictEqual(found.userVote, -1); // Voter's vote attached!

    // 9. Admin updates status to "In Progress"
    const adminToken = jwt.sign({ id: 'admin_id_test', role: 'admin' }, getJwtSecret());
    const resStatus = await fetch(`${baseUrl}/api/admin/issues/${issueId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'In Progress' }),
    });
    assert.strictEqual(resStatus.status, 200);
    const statusData = await resStatus.json();
    assert.strictEqual(statusData.issue.status, 'In Progress');

    // 10. Verify author received status_change notification
    const resNotif2 = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    const notifData2 = await resNotif2.json();
    const statusNotif = notifData2.notifications.find((n) => n.type === 'status_change');
    assert.ok(statusNotif);
    assert.ok(statusNotif.message.includes('In Progress'));

    // 11. Mark all notifications read
    const resRead = await fetch(`${baseUrl}/api/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    assert.strictEqual(resRead.status, 200);
  });

  describe('Security and Image Upload Tests', () => {
    test('Image URL Helper: buildImageUrl preserves cloud URLs and formats local filenames', () => {
      const { buildImageUrl } = require('../services/uploadService');
      const host = 'https://civic-sense-api.onrender.com';

      // 1. Full Cloudinary HTTPS URL should NOT be prefixed
      const cloudUrl = 'https://res.cloudinary.com/demo/image/upload/v123456/sample.jpg';
      assert.strictEqual(buildImageUrl(cloudUrl, host), cloudUrl);

      // 2. Local filename should be prefixed with host/uploads
      const localFile = '1729053912345.jpg';
      assert.strictEqual(buildImageUrl(localFile, host), `${host}/uploads/1729053912345.jpg`);

      // 3. Null / undefined returns null
      assert.strictEqual(buildImageUrl(null, host), null);
      assert.strictEqual(buildImageUrl(undefined, host), null);
      assert.strictEqual(buildImageUrl('', host), null);
    });

    test('Multipart Image Upload: Creates issue and attaches valid image URL in development', async () => {
      // Register or login a test user
      const userRes = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Upload Tester',
          email: 'uploader@civicsense.test',
          password: 'Password123!',
        }),
      });
      const userData = await userRes.json();
      const token = userData.token || (await (await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'uploader@civicsense.test',
          password: 'Password123!',
        }),
      })).json()).token;

      // Construct multipart form data using Node's native FormData
      const formData = new FormData();
      formData.append('title', 'Pothole with Photo Verification');
      formData.append('description', 'Pothole photographed on test street with clear hazard markers.');
      formData.append('category', 'Pothole');
      formData.append('landmark', 'TEST_LOCATION');
      formData.append('pincode', '400001');

      // 1x1 transparent PNG blob
      const dummyPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      const fileBlob = new Blob([dummyPng], { type: 'image/png' });
      formData.append('image', fileBlob, 'test-pothole.png');

      const res = await fetch(`${baseUrl}/api/issues`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.strictEqual(data.issue.title, 'Pothole with Photo Verification');
      assert.ok(data.issue.imageUrl, 'imageUrl must be present in response');
      assert.ok(
        data.issue.imageUrl.includes('/uploads/') || data.issue.imageUrl.startsWith('https://'),
        'imageUrl must be a valid path or cloud URL'
      );
    });

    test('Upload Resilience: Production mode blocks upload without Cloudinary and preserves database integrity', async () => {
      const { uploadImage } = require('../services/uploadService');

      // Temporarily set NODE_ENV=production without Cloudinary credentials
      const originalEnv = process.env.NODE_ENV;
      const originalCloud = process.env.CLOUDINARY_CLOUD_NAME;
      delete process.env.CLOUDINARY_CLOUD_NAME;
      process.env.NODE_ENV = 'production';

      let errorCaught = null;
      try {
        await uploadImage({
          buffer: Buffer.from('fake-image-content'),
          originalname: 'test.png',
          mimetype: 'image/png',
        });
      } catch (err) {
        errorCaught = err;
      } finally {
        process.env.NODE_ENV = originalEnv;
        if (originalCloud) process.env.CLOUDINARY_CLOUD_NAME = originalCloud;
      }

      assert.ok(errorCaught, 'Expected upload to reject when Cloudinary is unconfigured in production');
      assert.ok(
        errorCaught.message.includes('Cloudinary credentials') ||
        errorCaught.message.includes('missing in production')
      );
    });
  });
});
