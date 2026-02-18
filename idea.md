CPTrack – Goal-Based Competitive Programming Progress Tracker
1. Project Overview

CPTrack is a Full Stack Web Application designed to help competitive programmers track their progress in a structured, goal-oriented manner.

The platform allows users to:

Set a target rating (e.g., 1600 on Codeforces)

Set a daily problem-solving goal

Log solved problems manually

Track topic-wise and difficulty-wise progress

Monitor solving streaks

Visualize consistency using a heatmap

The primary focus of this project is backend system design and software engineering principles.

2. Problem Statement

Competitive programmers often face the following issues:

Inconsistent practice habits

No structured tracking system

Difficulty identifying weak topics

No measurable goal progression

No daily accountability

Platforms like Codeforces provide statistics but do not provide:

Personalized goal tracking

Daily progress monitoring

Topic-based performance analytics

Structured backend analytics services

CPTrack addresses these gaps by providing a structured tracking system backed by a well-designed backend architecture.

3. Project Scope (Milestone 1 Scope)

This is a Full Stack Application.

Backend Weightage: 75%
Frontend Weightage: 25%

Backend will follow proper:

OOP principles

Layered architecture

RESTful API design

Clean code structure

Repository pattern

Service layer abstraction

JWT authentication

Password hashing

Frontend will focus on:

Clean dashboard UI

Analytics visualization

Heatmap display

API integration

4. Core Features (MVP)
1. Authentication

User Registration

User Login

JWT-based authentication

Password hashing using bcrypt

2. Goal Management

Set target rating

Set daily problem goal

Update current rating

Store user progress metadata

3. Problem Logging

Users can log:

Problem name

Platform (e.g., Codeforces)

Difficulty (e.g., 800–2000)

Topic (e.g., DP, Graph, Math)

Solved date

4. Analytics Dashboard

System calculates:

Total problems solved

Problems solved by difficulty

Topic distribution

Weekly summary

Daily streak

5. Heatmap (Consistency Tracker)

GitHub-style activity grid

Visual representation of daily problem-solving activity

5. Functional Requirements

Only authenticated users can access dashboard

Users can log and delete problems

System automatically calculates streak

System dynamically computes analytics

All APIs follow REST standards

6. Non-Functional Requirements

Secure authentication

Encrypted passwords

Clean code structure

Scalable database schema

Modular backend design

Easy extensibility for future features

7. Backend Architecture

The backend follows a layered architecture:

Routes → Controllers → Services → Repositories → Database

Explanation:

Routes

Define API endpoints

Controllers

Handle HTTP requests and responses

Call service layer

Services

Contain business logic

Calculate streak, analytics, etc.

Repositories

Interact directly with database

Abstract database queries

Models

Define schema structure

8. OOP Principles Used
Encapsulation

Business logic is encapsulated inside service classes.

Abstraction

Controllers do not directly access the database.

Single Responsibility Principle

Each layer has one clear responsibility.

Separation of Concerns

Authentication, analytics, and logging are separated into modules.

9. Future Scope (Not Part of Milestone 1)

Automatic Codeforces API sync

Rating prediction model

AI-based topic weakness detection

Smart daily recommendations

Friend comparison system

Public profile sharing

10. Conclusion

CPTrack is a backend-focused full-stack application that demonstrates:

Proper system design

Clean layered architecture

OOP implementation

RESTful API structure

Real-world scalability

This project is specifically designed to showcase backend engineering capability while solving a real competitive programming problem.
