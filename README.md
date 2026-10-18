# Civic Sense

**A community-driven platform for reporting and tracking civic issues.**

Civic Sense helps citizens report local problems such as potholes, garbage accumulation, water leakage, broken streetlights, and illegal dumping. The goal is to make civic issue reporting more accessible and encourage community participation.

This is an open-source project. Developers and community members are welcome to contribute improvements, fixes, and new features.

## Features

- **Civic Issue Reporting:** Submit reports about local civic problems.
- **Issue Tracking:** View reported issues and their current status.
- **Location Support:** Associate reports with geographic locations.
- **Image Attachments:** Attach images to reports when image storage is configured and available.
- **User Authentication:** Register and log in to the platform.
- **Community Interaction:** View reports and participate through comments.
- **Responsive UI:** Use the application on desktop and mobile devices.

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js and Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **Image Storage:** Cloudinary integration for production uploads

## Live Demo

- **Frontend:** https://civic-sense-1-agud.onrender.com
- **Backend:** https://civic-sense-1q3f.onrender.com

The application is hosted on Render. The free hosting tier may take some time to respond after periods of inactivity.

## Getting Started

Follow the instructions below to run Civic Sense locally.

### Prerequisites

Install the following software:

- [Node.js](https://nodejs.org/)
- npm, included with Node.js
- A MongoDB database, either local or hosted through [MongoDB Atlas](https://www.mongodb.com/atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/atharvasawant-dev/Civic-sense.git
cd Civic-sense
```

### 2. Install and Configure the Backend

Open a terminal in the project root:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_local_development_secret
CLIENT_URL=http://localhost:3000
```

Replace the placeholder values with your local configuration. Keep these credentials private.

`JWT_SECRET` is **required**: the server refuses to start without it. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Set `CLIENT_URL` to your frontend origin(s), comma-separated, to restrict CORS. If it is unset, any origin is allowed (development only).

Start the backend:

```bash
npm start
```

The backend uses port `5000` by default.

### 3. Install and Configure the Frontend

The frontend reads the backend address from `REACT_APP_API_URL` at build time (defaults to `http://localhost:5000`). See `client/.env.example`.

Open a second terminal in the project root:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

Open the application in your browser:

http://localhost:3000

Keep both the frontend and backend terminals running while using the application.

## Environment Variables

### Backend Variables

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Configures the runtime environment |
| `PORT` | Port used by the backend server |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used for JWT authentication |
| `CLIENT_URL` | Frontend origin used by the backend's CORS configuration |

### Cloudinary Configuration

Production image uploads require valid Cloudinary credentials. Configure the following variables in the backend environment:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Known limitation:** Production image uploads will not work until Cloudinary is configured with valid credentials. Local development may use local file storage instead.

Never commit environment files, passwords, API keys, JWT secrets, or other credentials to the repository.

## Testing and Build

### Run Backend Tests

From the `server` directory:

```bash
npm test
```

### Build the Frontend

From the `client` directory:

```bash
npm run build
```

Run the relevant tests and build checks before submitting changes.

## Contributing

Contributions are welcome! You can help improve Civic Sense by fixing bugs, improving the user interface, writing tests, or implementing new features.

### How to Contribute

1. Fork this repository.
2. Clone your fork to your local machine.
3. Create a new feature branch.
4. Make your changes and test them.
5. Commit and push your changes to your fork.
6. Open a pull request against the `main` branch of this repository.

Example commands:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "feat: describe your change"
git push origin feature/your-feature
```

After pushing, open GitHub and create a pull request targeting `main`.

### Good First Contributions

- Fix bugs and improve error handling.
- Improve mobile responsiveness and accessibility.
- Add automated tests.
- Improve image upload and storage.
- Optimize application performance and scalability.
- Improve documentation and developer experience.
- Review security and authentication flows.

Found a bug or have a feature idea? [Open an issue](https://github.com/atharvasawant-dev/Civic-sense/issues).

### Contribution Guidelines

- Keep pull requests focused on a specific change.
- Write clear commit messages and pull request descriptions.
- Test changes before submitting them.
- Never commit secrets or private user data.
- Document any known limitations introduced by your changes.

## Deployment

The current production deployment uses Render for hosting and MongoDB Atlas for the database.

The frontend and backend are deployed as separate services. The current Render deployment uses the `demo-prep` branch, while `main` is the repository's default branch.

**Important:** Merging changes into `main` will not necessarily update the live application unless the Render deployment configuration is changed.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Repository

[https://github.com/atharvasawant-dev/Civic-sense](https://github.com/atharvasawant-dev/Civic-sense)

---

**Civic Sense — Report local problems. Help build better communities.**

## Tests

```bash
cd server && npm test
```
