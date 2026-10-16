# 🏛️ Civic-sense — Reddit-Style Community Civic Redressal Platform

> **Civic-sense** is a full-stack, community-driven civic engagement platform inspired by Reddit's democratic interaction model. It empowers citizens to report public grievances (potholes, garbage overflow, water leakage, broken streetlights, sewage failures), upvote critical infrastructure issues to elevate visibility, participate in municipal discussions, and track real-time resolution from municipal authorities.

---

## 🌟 Key Features & Reddit Interaction Model

### 1. 🗳️ Democratic Civic Feed & Community Upvoting
- **Reddit Score Ranking**: Issues feature dynamic upvote/downvote mechanics (+1 / -1) with real-time score calculation and duplicate-vote prevention (`{ issue, user }` unique index).
- **Sort & Discovery**: Sort grievances by **Popular** (highest community score) or **Latest** (newest submissions).
- **Category Feeds**: Quick filter chips across `c/Pothole`, `c/Garbage`, `c/Water Leakage`, `c/Streetlight`, `c/Drainage`, and `c/Other`.
- **Status Filter**: Real-time status segmentation across **Pending**, **In Progress**, and **Resolved**.
- **Real-Time Search**: Search issues by title, description, or landmark.

### 2. 📱 Responsive Navigation & Mobile Experience
- **Slide-out Navigation Drawer**: Accessible via a hamburger menu on desktop and mobile.
- **Mobile Bottom Navigation Bar**: Seamless thumb-friendly access to Feed, Popular, Report Issue, Alerts, and Profile on mobile devices.
- **Resilient Media Architecture**: Automatic SVG category placeholder fallbacks ensuring zero broken image cards even when media is loading or unhosted.

### 3. 🔍 Deep Issue Detail & Threaded Discussions
- **Municipal Resolution Timeline**: Visual 3-stage progress bar tracking issue progression (`Pending` ➔ `In Progress` ➔ `Resolved`).
- **Threaded Community Discussions**: Nested comment and reply system allowing citizens and authorities to coordinate and post updates.
- **Author Moderation**: Secure comment deletion allowing authors to remove their own remarks.

### 4. 🔔 Real-Time Notification Center
- In-app notification bell with live unread badge counters.
- Automatic alerts dispatched when:
  - An administrator updates the issue status (Pending ➔ In Progress ➔ Resolved).
  - Another citizen comments on your report.
  - Fellow citizens upvote your civic submission.
- One-click "Mark all as read" and direct jump-to-issue navigation.

### 5. 🎖️ Citizen Profile & Civic Karma Score
- Dynamic **Civic Karma** calculation based on user contributions: `(Reports × 10) + (Net Upvotes on Reports × 5) + (Comments × 2)`.
- Editable user bio, pincode, and citizen activity tabs (Track upvoted issues and posted comments).

### 6. 🛡️ Authority Admin Command Dashboard
- Restricted to verified administrative personnel (`verifyAdmin` middleware).
- Tri-state grievance triage buttons (`Pending`, `In Progress`, `Resolved`).
- Authority-initiated ticket closure with automatic notification dispatch to the original reporter.

---

## 🔐 Demo Credentials (Recruiter Walkthrough)

For live demo evaluation, the database seed script generates pre-configured accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| 👑 **Municipal Admin** | `admin@civicsense.org` | `admin123` | Full admin dashboard, triage status buttons, ticket resolution |
| 🙋 **Citizen (Aarav)** | `citizen@civicsense.org` | `citizen123` | Report issues, upvote, comment, track notifications & karma |
| 🙋 **Citizen (Priya)** | `priya@civicsense.org` | `citizen123` | Active reporter with sample comments and notifications |

---

## 🏗️ System Architecture & Tech Stack

```
Civic-sense/
├── client/                     # React 19 Single Page Application
│   ├── public/
│   │   ├── _redirects          # Netlify SPA rewrite rule
│   │   └── vercel.json         # Vercel SPA rewrite configuration
│   └── src/
│       ├── components/         # Header, Drawer, IssueCard, CategoryPlaceholder
│       ├── pages/              # Home, IssueDetail, ReportIssue, Notifications,
│       │                       # Profile, MyIssues, MyActivity, Admin, Login, Register
│       └── config.js           # Centralized environment API base resolver
└── server/                     # Node.js & Express REST Backend
    ├── config/                 # JWT secret & environment resolver
    ├── controllers/            # Authentication & credential hashing (bcryptjs)
    ├── middleware/             # Role authorization (verifyUser, verifyAdmin, optionalAuth)
    ├── models/                 # Mongoose Schemas (User, Issue, Vote, Comment, Notification)
    ├── routes/                 # Express Routers (issueRoutes, adminRoutes, userRoutes, etc.)
    ├── scripts/                # Database seed script (seed.js)
    ├── tests/                  # Automated integration tests (node:test)
    └── app.js                  # Central Express application
```

- **Frontend**: React 19, React Router v7, HTML5 / CSS3 Responsive Grid, Fetch API.
- **Backend**: Node.js v20+, Express 5, Mongoose 8.
- **Security**: JWT (JSON Web Tokens) with production enforcement, bcryptjs password hashing, email canonicalization, Multer secure file filter.
- **Testing**: Native Node.js test runner (`node:test` + `node:assert`) executing against an isolated test database (`civic_sense_test`).

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (running locally on `mongodb://localhost:27017` or MongoDB Atlas URI)

### 1. Clone & Set Up Server

```bash
cd server
npm install
```

Create a `.env` file in `server/` (optional for local development, defaults provided):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civic_sense
JWT_SECRET=demo_local_jwt_secret_key_32chars_min
ALLOWED_ORIGIN=http://localhost:3000
```

Seed the database with sample issues, votes, discussions, and demo accounts:
```bash
npm run seed
```

Run tests to verify the backend integrity:
```bash
npm test
```

Start the API server:
```bash
npm start
# Server listens on http://localhost:5000
```

### 2. Set Up Client

Open a new terminal window:
```bash
cd client
npm install
```

Start the React development server:
```bash
npm start
# Client will launch at http://localhost:3000
```

---

## 🧪 Automated Testing & Verification

The backend includes a zero-dependency integration test suite covering end-to-end flows:
- **Server Health & Metrics**: Verifies health checks and aggregate statistics.
- **Security & Authorization**: Verifies unauthenticated mutation blocking and admin route locking.
- **Auth Flow**: Registration, login, JWT token issuance, and profile retrieval.
- **Reddit Core Flow**: Issue submission, upvote/downvote toggles, score calculation, comment threads, and notification delivery.

To run tests:
```bash
cd server
npm test
```

> **Database Safety Notice**: The test runner enforces safety by executing against `civic_sense_test` and will throw a fatal exception if executed with `NODE_ENV=production`.

---

## ☁️ Deployment Guide

### Frontend (Vercel or Netlify)
1. Set the root directory to `client`.
2. Build command: `npm run build`
3. Output directory: `build`
4. Set environment variable:
   - `REACT_APP_API_BASE_URL`: URL of your deployed backend (e.g., `https://civic-sense-api.onrender.com/api`)
5. SPA redirect rules are already included (`client/public/_redirects` and `client/vercel.json`).

### Backend (Render, Railway, or Fly.io)
1. Set the root directory to `server`.
2. Build command: `npm install`
3. Start command: `node app.js`
4. Configure environment variables in the host dashboard:
   - `PORT`: `5000` (or assigned port)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your managed MongoDB Atlas connection string
   - `JWT_SECRET`: High-entropy 64-character secret
   - `ALLOWED_ORIGIN`: Your deployed frontend domain (e.g., `https://civicsense.vercel.app`)

### Persistent Image Storage Recommendation
The application currently supports local Multer uploads in development and includes resilient category placeholder fallbacks (`CategoryPlaceholder.js`). For production deployment on ephemeral hosting (Render/Heroku):
- Recommended: Configure **Cloudinary** (`multer-storage-cloudinary`) or **AWS S3** / **Supabase Storage** to persist uploaded issue images across container restarts.

---

## 📄 License
This project is licensed under the MIT License.
