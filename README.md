# Cinema System - Backend API

## Overview
This is a robust backend REST API built for a Cinema Booking System. It handles the core logic for managing movies, cinema halls, screening schedules, seat reservations, and user authentication. The server is built with Node.js and Express, and uses MongoDB as its database.

## Key Features
* **User Authentication & Authorization:** Secure registration and login using encrypted passwords (bcrypt) and JWT (JSON Web Tokens). Includes role-based access control (Admin vs. Regular User).
* **Movie & Hall Management:** Admins can add and manage movies and cinema halls.
* **Screening Management:** Prevents scheduling conflicts by mathematically verifying that new screenings do not overlap with existing ones in the same hall.
* **Order & Seat Management:** Uses atomic operations in MongoDB to lock seats during the booking process, preventing double-booking (concurrency control).
* **Automated Cleanup (Cron Jobs):** A background task runs automatically to find abandoned orders (pending for over 10 minutes) and releases the locked seats back to the public.

## Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (with Mongoose ODM)
* **Security:** bcryptjs (password hashing), jsonwebtoken (auth tokens)
* **Background Tasks:** node-cron

## Getting Started

### Prerequisites
Make sure you have Node.js installed and a MongoDB connection string (local or MongoDB Atlas).

### env example
PORT =
MONGO_URL =
JWT_SECRET =

### Installation
1. Clone the repository and navigate to the project folder.
2. Install the dependencies:
   ```bash
   npm install