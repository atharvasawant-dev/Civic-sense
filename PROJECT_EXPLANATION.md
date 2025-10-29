# Civic Sense Project Explanation

## Project Overview
Civic Sense is a MERN stack web application designed to help citizens report, track, and resolve civic issues in their city. Users can register, log in, submit issues with images and descriptions, view their issue status, and admins can manage all reported issues.

---

## Folder & File Structure

### Root
- **client/**: Contains the React front-end code.
- **server/**: Contains the Node.js/Express back-end code.

### client/
- **public/**: Static files and the main HTML template.
- **src/**: Main source code for the React app.
  - **components/**: Reusable UI components.
    - `Header.js`: Navigation bar for all pages. Uses React Router for navigation.
    - `Footer.js`: Footer displayed on all pages.
    - `IssueForm.js`: Form for submitting a new civic issue. Handles image upload, description, validation, and preview.
    - `IssueTable.js`: Displays issues as cards with image, description, status, and date.
  - **pages/**: Page-level components for routing.
    - `Home.js`: Homepage with hero section, about, gallery, and info cards.
    - `ReportIssue.js`: Page for submitting a new issue. Uses `IssueForm`.
    - `MyIssues.js`: Page showing issues reported by the user. Uses `IssueTable`.
    - `Admin.js`: Admin dashboard showing all issues in a table. Allows status management (future).
    - `Register.js`: User registration page with form validation.
    - `Login.js`: User login page with form validation.
  - **styles/**: Custom CSS for the app. `App.css` contains all styles for layout, cards, forms, and responsiveness.
  - `App.js`: Main React component. Sets up routing for all pages.
  - `index.js`: Entry point for React app. Renders `App`.

### server/
- **controllers/**: (Planned) Logic for handling requests, e.g., issue and user management.
- **models/**: (Planned) Mongoose models for MongoDB, e.g., Issue and User schemas.
- **routes/**: Express routes for API endpoints.
  - `issueRoutes.js`: Handles GET and POST requests for issues. Stores issues in memory for now.
- **middleware/**: (Planned) For authentication, error handling, etc.
- **uploads/**: (Planned) For storing uploaded images if needed.
- **config/**: (Planned) For database and environment configuration.
- `app.js`: Main Express server file. Sets up middleware and API routes.

---

## Technical Explanation

### Frontend (React)
- **Routing**: Uses React Router for navigation between pages.
- **State Management**: Uses React hooks (`useState`, `useEffect`) for local state.
- **UI Components**: Modular components for header, footer, forms, and cards.
- **Image Upload**: Validates image size (max 2MB), shows preview, and passes image data to backend (future).
- **Card Layouts**: Issues are displayed as cards for clarity and professional look.
- **Form Validation**: All forms check for required fields and show error messages.
- **Responsive Design**: CSS ensures the app works on all screen sizes.

### Backend (Node.js/Express)
- **API Endpoints**: `/api/issues` for submitting and fetching issues.
- **Data Storage**: Issues are stored in memory for now; planned MongoDB integration.
- **Middleware**: Uses `cors` and `express.json` for API requests.
- **Planned Features**: User authentication, image storage, admin controls, and database integration.

---

## Purpose of Each File

- **Header.js**: Provides navigation links to all main pages. Ensures users can easily access all features.
- **Footer.js**: Displays copyright info. Consistent branding.
- **IssueForm.js**: Lets users submit new issues. Handles image upload, validation, and preview.
- **IssueTable.js**: Shows issues in a card format. Improves readability and UI.
- **Home.js**: Welcomes users, explains the platform, and showcases city images and process steps.
- **ReportIssue.js**: Dedicated page for reporting issues. Uses IssueForm for input.
- **MyIssues.js**: Shows issues reported by the logged-in user. Uses IssueTable for display.
- **Admin.js**: Admin dashboard. Shows all issues and (future) allows status updates.
- **Register.js**: User registration form. Validates input and shows success/error.
- **Login.js**: User login form. Validates input and shows success/error.
- **App.js**: Main app component. Sets up routing and renders header/footer.
- **index.js**: Entry point for React. Renders the app.
- **App.css**: Contains all custom styles for layout, cards, forms, and responsiveness.
- **issueRoutes.js**: Express route for GET/POST issue API. Handles issue data.
- **app.js**: Sets up Express server, middleware, and API routes.

---

## Engineering Rationale
- **MERN Stack**: Chosen for full JavaScript development, scalability, and popularity.
- **Modular Structure**: Each feature is separated for maintainability and teamwork.
- **Card-Based UI**: Improves clarity and user experience.
- **Validation**: Ensures data integrity and user feedback.
- **Responsive Design**: Accessible on all devices.
- **Planned Features**: Database, authentication, and admin controls for real-world use.

---

## How to Explain to Your Guide
- Start with the project overview and goals.
- Walk through the folder structure and explain the purpose of each file.
- Discuss technical choices (MERN, modularity, UI/UX decisions).
- Show how users interact with the app (register, login, report, track, admin).
- Mention planned improvements (database, authentication, image storage).

---

## Common Questions & Answers
- **Why this tech stack?** Full JS, scalable, popular for web apps.
- **How is data validated?** Frontend checks, backend planned.
- **How are images handled?** Preview, size limit, future backend storage.
- **How is user authentication managed?** Currently frontend, backend planned.
- **How would you scale this?** Add MongoDB, deploy on cloud, use JWT for auth.
- **How did you ensure UI/UX?** Modern design, responsive layout, clear navigation.

---

Feel free to read and use this file for your project explanation and viva preparation!
