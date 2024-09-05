# WBS Coding School Final Project - SnapTask Backend

## Node.js / Express / MongoDB / Mongoose
![Node.js](https://img.shields.io/badge/Node.js-v14.17.0-green)
![Express](https://img.shields.io/badge/Express-v4.17.1-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v4.4.6-brightgreen)
![Mongoose](https://img.shields.io/badge/Mongoose-v5.12.7-red)

## Frontend Repo 
https://github.com/SebSchoeneberger/Final-Project-Fe

## Overview

SnapTask is a task management platform that streamlines the assignment and tracking of tasks for different areas within an organization. This repository contains the backend code for SnapTask, which is built using Node.js, Express, MongoDB, and Mongoose.

## Features

- **User Management**: Admin and Manager roles can create and manage users.
- **Area Management**: Create and manage areas for organizing tasks.
- **Task Management**: Assign tasks to specific areas and users. Track the status of tasks in real-time.
- **QR Code Integration**: Generate and print QR codes for tasks, which can be scanned by staff to quickly access task details.
- **Reporting**: Generate performance and activity reports.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API docs](#api-docs)
  
## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14.17.0 or higher)
- [MongoDB](https://www.mongodb.com/) (v4.4.6 or higher)
- [Git](https://git-scm.com/)

### Steps

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/snap-task-backend.git
    cd snap-task-backend
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
    - Create a `.env` file in the root directory.
    - Add the following environment variables:
      ```env
      PORT=5000
      MONGODB_URI=mongodb://your_connection_string
      JWT_SECRET=your_secret_key
      ```

4. **Start the development server**:
    ```bash
    npm run dev
    ```

   The server will start on `http://localhost:8000`.


### Running the Server

- **Development**: 
    ```bash
    npm run dev
    ```
- **Production**: 
    ```bash
    npm start
    ```



## Environment Variables

Ensure the following environment variables are set in your `.env` file:

```env

MONGO_URI=your_string
PORT=5000
JWT_SECRET=your_secret_key

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=eu-central-1
AWS_S3_BUCKET_NAME=your_aws_s3_bucket_name

SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

## API Docs
[https://documenter.getpostman.com/view/36668209/2sA3s7k9jy](https://documenter.getpostman.com/view/36668209/2sA3s7k9jy)

### Auth
- **POST** `/auth/signup` - Creates new user account.
- **POST** `/auth/login` - Authenticates the user.
- **GET** `/auth/me` - Get the logged-in user data.

### Areas
- **GET** `/areas` - Get account areas based on the token
- **POST** `/areas` - Creates new area
- **PUT** `/areas/:id` - Update an existing area
- **DELETE** `/areas/:id` - Deletes an area

### Users
- **GET** `/users?page=1&perPage=5` - Get the users associated with the account based on the user token
- **POST** `/users` - Creates new user for this account
- **PUT** `/users/:id` - Updates an existing user 
- **DELETE** `/users/:id` - Deletes an existing user

### Tasks
- **GET** `/tasks?page=1&perPage=10&status=New,In Progress` - Get user tasks based on the token
- **GET** `/tasks/:id` - Get task details by ID 
- **POST** `/tasks` - Creates new task
- **PUT** `/tasks/:id` - Updates an existing task
- **DELETE** `/tasks/:id` - Deletes the task

### Reports / Stats
- **GET** `/reports/dashboard/stats?area=66c458509e97a03372944042` - Get dashboard stats (all or for specific area)
- **GET** `/reports/dashboard/weeklyTasks?page=1&perPage=5` - Get weekly tasks

### Email
- **POST** `/email/invitation` - Sends invitation email
