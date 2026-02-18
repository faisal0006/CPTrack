# 📌 Class Diagram – CPTrack

## Overview

This class diagram represents the major backend classes of the CPTrack system.

The backend follows a layered architecture:

- Controllers (handle HTTP requests)
- Services (business logic)
- Repositories (database abstraction)
- Models (data structure definitions)

The diagram demonstrates OOP principles such as:

- Encapsulation
- Abstraction
- Separation of Concerns
- Repository Pattern

---

```mermaid
classDiagram

    %% =======================
    %% MODELS
    %% =======================

    class User {
        -ObjectId id
        -string name
        -string email
        -string password
        -number currentRating
        -number targetRating
        -number dailyGoal
        -number streak
        -Date createdAt
        +updateGoal()
        +updateRating()
    }

    class ProblemLog {
        -ObjectId id
        -ObjectId userId
        -string problemName
        -number difficulty
        -string topic
        -string platform
        -Date solvedDate
    }

    %% =======================
    %% CONTROLLERS
    %% =======================

    class AuthController {
        +register(req, res)
        +login(req, res)
    }

    class ProblemController {
        +logProblem(req, res)
        +deleteProblem(req, res)
        +getUserProblems(req, res)
    }

    class UserController {
        +getProfile(req, res)
        +updateGoal(req, res)
    }

    %% =======================
    %% SERVICES
    %% =======================

    class AuthService {
        +registerUser(data)
        +authenticateUser(data)
    }

    class ProblemService {
        +createProblemLog(data)
        +removeProblemLog(id)
        +getProblems(userId)
    }

    class AnalyticsService {
        +calculateStreak(userId)
        +generateDifficultyStats(userId)
        +generateTopicStats(userId)
        +generateWeeklySummary(userId)
    }

    %% =======================
    %% REPOSITORIES
    %% =======================

    class UserRepository {
        +save(user)
        +findByEmail(email)
        +findById(id)
        +update(user)
    }

    class ProblemRepository {
        +save(problem)
        +findByUser(userId)
        +delete(problemId)
    }

    %% =======================
    %% RELATIONSHIPS
    %% =======================

    User "1" --> "many" ProblemLog

    AuthController --> AuthService
    ProblemController --> ProblemService
    UserController --> UserRepository

    AuthService --> UserRepository
    ProblemService --> ProblemRepository
    ProblemService --> AnalyticsService

    AnalyticsService --> ProblemRepository
```

---

## Class Responsibilities

### Models

**User**
- Stores authentication and goal-related data.
- Maintains rating, streak, and daily goal.

**ProblemLog**
- Represents a logged solved problem.
- Links to a specific user.

---

### Controllers

Controllers:
- Handle HTTP requests and responses.
- Delegate business logic to services.
- Do not directly access the database.

---

### Services

Services:
- Contain core business logic.
- Handle streak calculation.
- Generate analytics.
- Coordinate multiple repositories if required.

---

### Repositories

Repositories:
- Abstract database operations.
- Prevent direct database access from controllers/services.
- Enable easy database switching or mocking in tests.

---

## Design Justification

This class structure demonstrates:

- **Encapsulation** – Business logic resides in service classes.
- **Abstraction** – Controllers do not access the database directly.
- **Single Responsibility Principle** – Each class has a clear purpose.
- **Repository Pattern** – Database operations are separated from logic.
- **Scalability** – Easy to add new services (e.g., Codeforces API integration).

This backend-focused design aligns with the 75% backend scoring requirement.
