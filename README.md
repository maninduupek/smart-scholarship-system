# Smart Scholarship Application and Management System

## Project Overview

The Smart Scholarship Application and Management System is a full-stack web application designed to simplify scholarship management for students, scholarship providers, and administrators.

The system allows students to discover and apply for scholarships, providers to manage scholarship opportunities and review applications, and administrators to manage platform users.

This project was developed as part of the DevOps Engineering module.

## Technologies Used

| Component | Technology |
|---|---|
| Frontend | React.js, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT, bcrypt |
| Containerization | Docker, Docker Compose |
| Web Server | Nginx |
| Version Control | Git, GitHub |
| CI | GitHub Actions |

## Main Features

### Student
- Register and log in securely
- Browse available scholarships
- View scholarship details
- Apply for scholarships
- Track submitted applications and their statuses
- Manage student profile information

### Scholarship Provider
- Create and manage scholarship opportunities
- Review student applications
- Update application statuses
- Manage scholarship listings

### Administrator
- Access the administrator dashboard
- View and manage registered users
- Oversee platform activities

## System Architecture

The application follows a three-tier architecture:

- **Frontend:** React application served using Nginx
- **Backend:** REST API developed with Node.js and Express.js
- **Database:** MongoDB for persistent data storage

Docker Compose is used to manage the three application services.

## Running Locally with MongoDB

1. Start the local MongoDB service on port `27017`.
2. Copy `backend/.env.example` to `backend/.env` and set a private, long
   `JWT_SECRET`. The MongoDB setting should be:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/smartScholarshipDB
   ```

3. In one terminal, start the backend:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. In another terminal, start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The Vite development server proxies `/api` requests to the backend at
`http://localhost:5000`.

## Running the Project with Docker

### Prerequisites

- Docker Desktop
- Docker Compose
- Git

### Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/maninduupek/smart-scholarship-system.git
   ```

2. Navigate to the project directory:

   ```bash
   cd smart-scholarship-system
   ```

3. Copy `backend/.env.example` to `backend/.env` and set a private, long
   `JWT_SECRET`. Docker Compose connects the backend to its MongoDB service
   automatically; the local `MONGODB_URI` in this file is overridden inside
   the container.

4. Start the application:

   ```bash
   docker compose up -d --build
   ```

5. Access the application:

   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - MongoDB host port: 27018

6. Check the running containers:

   ```bash
   docker compose ps
   ```

7. Stop the application without deleting its persistent data:

   ```bash
   docker compose stop
   ```

The MongoDB data is stored in a named Docker volume and persists when the
containers are stopped. The Docker-host MongoDB port is `27018`; the local
MongoDB URI above uses port `27017`.

## Continuous Integration

GitHub Actions automatically runs the configured CI workflow when changes are pushed to the repository.

The workflow has successfully validated recent project changes, including the frontend production build.

## Functional Testing

The following functionality has been manually verified:

- Website accessibility
- Student authentication
- Scholarship application submission
- Application tracking
- Provider dashboard access
- Application status updates
- Administrator dashboard access
- Docker container startup

## Security

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Environment variables for sensitive configuration
- Secrets and database backups must not be committed to GitHub

## Project Status

Core application development, Docker containerization, and GitHub Actions CI setup are complete. Final documentation and verification are in progress.

## Repository

https://github.com/maninduupek/smart-scholarship-system
