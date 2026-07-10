# Doctor Appointment Booking System

A full-stack MERN application for doctor discovery, doctor applications, appointment scheduling, notifications, availability management, and secure medical document sharing.

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Bootstrap
- React Toastify
- Vitest
- React Testing Library

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Jest
- Supertest

## User Roles

The application supports three roles:

- Patient
- Doctor
- Administrator

## Main Features

### Patient Features

- Register and log in
- JWT-based authenticated sessions
- Browse approved doctors
- View doctor information
- Select appointment dates
- Fetch dynamically generated available time slots
- Book appointments
- Optionally upload a medical document
- Upload PDF, JPEG, or PNG documents
- Maximum medical document size of 5 MB
- View appointment history
- Track appointment status
- Apply to become a doctor
- Receive notifications
- View unread notification count
- Mark individual notifications as read
- Mark all notifications as read

### Doctor Features

- Access a role-protected doctor dashboard
- View and manage professional profile
- Configure weekly availability
- Configure multiple availability sessions
- Set appointment slot duration
- Add blocked or unavailable dates
- View assigned patient appointments
- View patient contact information
- Approve pending appointments
- Reject pending appointments
- Mark approved appointments as completed
- Securely access medical documents attached to assigned appointments

### Administrator Features

- Access a role-protected admin dashboard
- View pending doctor applications
- Approve doctor applications
- Reject doctor applications
- Trigger application decision notifications

## Security and Validation

The application includes the following security and validation measures:

- Password hashing with bcrypt
- JWT-based authentication
- Protected frontend routes
- Backend authentication middleware
- Role-based authorization
- Administrator-only route protection
- Doctor-only route protection
- MongoDB ObjectId validation
- Appointment status transition validation
- Medical document file type validation
- Maximum medical document size validation of 5 MB
- Uploaded-file cleanup when booking validation fails
- Assigned-doctor authorization for medical document access
- Protection against cross-doctor medical document access
- Private uploaded medical documents excluded from Git

## Appointment Workflow

1. The patient browses the list of approved doctors.
2. The patient selects a doctor.
3. The patient chooses an appointment date.
4. The system generates the available appointment slots for that date.
5. The patient selects an available time slot.
6. The patient may optionally attach a PDF, JPEG, or PNG medical document.
7. The appointment is booked with Pending status.
8. The doctor reviews the assigned appointment.
9. The doctor can Approve or Reject the pending appointment.
10. An Approved appointment can later be marked Completed.
11. Relevant appointment events generate notifications for the patient.

## Doctor Application Workflow

1. A patient submits an application to become a doctor.
2. The application remains pending for administrator review.
3. The administrator reviews the pending application.
4. The administrator Approves or Rejects the application.
5. The applicant receives a notification about the decision.
6. An approved applicant receives doctor access and can use the doctor dashboard.

## Project Structure

The repository contains separate frontend and backend applications:

```text
doctor-appointment-booking-system/
├── client/
│   └── src/
│       ├── components/    Reusable UI components
│       ├── context/       Authentication and notification state
│       ├── dashboard/     Patient, doctor, and administrator dashboards
│       ├── pages/         Application pages
│       ├── services/      Axios API configuration
│       └── test/          Frontend test setup
│
├── server/
│   ├── config/            Database configuration
│   ├── controllers/       Request handling and business logic
│   ├── middleware/        Authentication, authorization, validation, and uploads
│   ├── models/            Mongoose data models
│   ├── routes/            API route definitions
│   ├── tests/             Backend integration tests
│   ├── uploads/           Private medical document storage
│   └── utils/             Reusable backend utilities
│
├── README.md
└── LICENSE
```

## Environment Configuration

The repository includes `server/.env.example` as a safe configuration template.

Create the local environment file by copying the template:

```bash
cd server
cp .env.example .env
```

Then replace the placeholder values in `.env` with your actual configuration.

Example configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
MONGO_URI_TEST=your_test_database_connection_string
```

### Environment Variable Purpose

- `PORT` - port used by the Express server
- `MONGO_URI` - MongoDB connection string for the main application database
- `JWT_SECRET` - secret key used to sign and verify authentication tokens
- `MONGO_URI_TEST` - separate MongoDB connection string used by the backend test suite

Do not commit real database credentials or JWT secrets to Git.

## Installation and Running

### Prerequisites

Before running the project, install:

- Node.js
- npm
- Git
- MongoDB Atlas account or another accessible MongoDB database

### 1. Clone the Repository

```bash
git clone https://github.com/gantasrinivasarao96/doctor-appointment-booking-system.git
cd doctor-appointment-booking-system
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure Backend Environment Variables

From the `server` directory, create the local environment file from the provided template:

```bash
cp .env.example .env
```

Then edit `.env` and replace the placeholder values with your actual MongoDB connection strings and JWT secret.

The real `.env` file is ignored by Git and must not be committed.

### 4. Start the Backend Server

From the `server` directory:

```bash
node server.js
```

By default, the backend runs on port `5000` when `PORT=5000` is configured.

### 5. Install Frontend Dependencies

Open another terminal and run:

```bash
cd doctor-appointment-booking-system/client
npm install
```

### 6. Start the Frontend Development Server

From the `client` directory:

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

### 7. Create a Production Frontend Build

```bash
cd client
npm run build
```

The production build is generated in the `client/dist/` directory.

## Testing

The project includes automated backend integration tests and frontend component and workflow tests.

### Backend Tests

The backend test suite uses Jest and Supertest.

Make sure `MONGO_URI_TEST` points to a separate test database before running the backend tests.

From the repository root:

```bash
cd server
npm test
```

The backend tests cover major workflows including:

- Authentication
- Authorization and role protection
- Doctor application lifecycle
- Appointment booking and slot validation
- Appointment status transitions
- Notification workflows
- Medical document upload validation
- Medical document authorization and access

### Frontend Tests

The frontend test suite uses Vitest and React Testing Library.

From the repository root:

```bash
cd client
npm test -- --run
```

The frontend tests cover major UI workflows including:

- Registration and login
- Authentication context
- Protected routes
- Doctor discovery
- Appointment booking
- Patient appointment history
- Doctor dashboard appointment management
- Medical document access from the doctor dashboard
- Administrator doctor application management
- Notification context and notification bell behavior

### Production Build Verification

To verify that the frontend can be built for production:

```bash
cd client
npm run build
```

## API Overview

All backend API endpoints use the `/api/v1` prefix.

### Authentication Routes

Base path: `/api/v1/auth`

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Authenticate a user | Public |
| GET | `/me` | Get the current authenticated user | Authenticated |

### User Routes

Base path: `/api/v1/user`

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/profile` | Get the authenticated user profile | Authenticated |

### Doctor Routes

Base path: `/api/v1/doctor`

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/apply` | Submit or resubmit a doctor application | Authenticated |
| GET | `/profile` | Get the logged-in doctor profile | Authenticated |
| PUT | `/profile` | Update the logged-in doctor profile | Authenticated |
| GET | `/all` | Get all approved doctors | Public |
| GET | `/:id` | Get one approved doctor by ID | Public |

### Administrator Routes

Base path: `/api/v1/admin`

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/doctors/pending` | Get pending doctor applications | Administrator |
| PUT | `/doctors/approve/:id` | Approve a doctor application | Administrator |
| PUT | `/doctors/reject/:id` | Reject a doctor application | Administrator |

### Appointment Routes

Base path: `/api/v1/appointment`

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/available-slots` | Get available appointment slots for a doctor and date | Authenticated |
| POST | `/book` | Book an appointment with an optional medical document | Authenticated |
| GET | `/user` | Get appointments for the logged-in patient | Authenticated |
| GET | `/doctor` | Get appointments assigned to the logged-in doctor | Doctor |
| GET | `/:id/medical-document` | Access a medical document for an assigned appointment | Doctor |
| PUT | `/update/:id` | Update appointment status | Doctor |

### Notification Routes

Base path: `/api/v1/notification`

All notification routes require authentication.

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/` | Get notifications for the logged-in user | Authenticated |
| PUT | `/read-all` | Mark all notifications as read | Authenticated |
| PUT | `/:id/read` | Mark one notification as read | Authenticated |
| DELETE | `/` | Delete all notifications | Authenticated |
| DELETE | `/:id` | Delete one notification | Authenticated |
