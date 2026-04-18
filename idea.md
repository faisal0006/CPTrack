# 🚀 CPTrack – Goal-Based Competitive Programming Progress Tracker

---

## Overview

**CPTrack** is a full-stack web application that helps competitive programmers track their problem-solving journey in a structured and goal-oriented manner.

Platforms like Codeforces provide raw statistics such as rating, submissions, and solved counts. However, they do not provide structured goal tracking, topic-wise weakness identification, or daily accountability systems.

CPTrack focuses on building a backend-driven analytics system that allows users to define measurable goals and monitor consistency, performance trends, and improvement areas.

---

## Problem Statement

1. **Lack of structured goal tracking** – Users set target ratings (e.g., 1600) but cannot systematically measure progress toward them.

2. **Inconsistent practice habits** – Without streak tracking or daily goal monitoring, users lose consistency.

3. **No topic-level performance insights** – Platforms show solved counts but do not clearly identify weak areas like DP, Graphs, or Number Theory.

4. **Limited analytics beyond rating** – Users cannot view difficulty trends, weekly summaries, or structured performance reports.

5. **No daily accountability system** – There is no mechanism to visualize or enforce daily problem-solving goals.

---

## Scope

---

### In Scope

- User authentication (Register / Login)
- JWT-based authentication system
- Password hashing using bcrypt
- Goal setting (target rating, daily goal)
- Problem logging (name, difficulty, topic, platform, solved date)
- Streak calculation system
- Difficulty-wise analytics
- Topic distribution analytics
- Weekly summary generation
- GitHub-style activity heatmap
- RESTful API design
- Layered backend architecture (Controller → Service → Repository → Database)

---

### Out of Scope (Milestone 1)

- Automatic Codeforces API sync
- Real-time contest simulation
- AI-based recommendation engine
- Rating prediction using ML
- Friend comparison system
- Payment integration
- Admin dashboard

---

## Tech Stack

### Backend (Primary Focus – 75%)

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt

### Frontend (25%)

- React
- Tailwind CSS
- Axios
- Chart library for analytics visualization

---

## Architecture Design

The backend follows a clean layered architecture:

Routes → Controllers → Services → Repositories → Database

This ensures:

- Separation of concerns  
- Encapsulation of business logic  
- Abstraction of database operations  
- Maintainability and scalability  

---

## OOP & Design Principles Used

- **Encapsulation** – Business logic is contained inside service classes.
- **Abstraction** – Controllers do not directly interact with the database.
- **Single Responsibility Principle** – Each layer has a clearly defined role.
- **Repository Pattern** – Database logic is abstracted via repositories.
- **Modular Design** – Authentication, logging, and analytics are separated into modules.

---

## Conclusion

CPTrack is a backend-focused full-stack application designed to demonstrate strong software engineering practices, proper system design, and scalable architecture while solving a real-world competitive programming tracking problem.
