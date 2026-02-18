# 📌 Use Case Diagram – CPTrack

## Overview

This diagram shows all major use cases for the CPTrack platform, organized by the primary actor: **User**.

The system focuses on:

- Authentication
- Goal management
- Problem logging
- Analytics generation
- Streak calculation
- Heatmap visualization

---

```mermaid
graph TB

    subgraph CPTrack Platform

        UC1["Register / Login"]
        UC2["Manage Profile"]
        UC3["Set Target Rating"]
        UC4["Set Daily Goal"]
        UC5["Log Solved Problem"]
        UC6["Delete Logged Problem"]
        UC7["View Dashboard"]
        UC8["View Difficulty Analytics"]
        UC9["View Topic Distribution"]
        UC10["View Weekly Summary"]
        UC11["View Heatmap"]
        UC12["Calculate Streak"]
        UC13["Generate Analytics Report"]
        UC14["Update Current Rating"]

    end

    %% Actor
    User((User))

    %% User Use Cases
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC10
    User --> UC11
    User --> UC14

    %% System-driven (internal processes)
    UC5 -->|triggers| UC12
    UC5 -->|triggers| UC13
    UC6 -->|triggers| UC13
    UC7 -->|loads| UC13
    UC13 --> UC8
    UC13 --> UC9
    UC13 --> UC10
```

---

## Use Case Descriptions

| Use Case | Actor | Description |
|----------|--------|------------|
| UC1 | User | Register a new account or login securely using credentials. |
| UC2 | User | Manage profile details such as name and current rating. |
| UC3 | User | Set or update target competitive programming rating. |
| UC4 | User | Define daily problem-solving goal. |
| UC5 | User | Log a solved problem with difficulty, topic, and date. |
| UC6 | User | Delete a previously logged problem entry. |
| UC7 | User | View dashboard summary of overall progress. |
| UC8 | User | View analytics grouped by difficulty level. |
| UC9 | User | View topic-wise performance distribution. |
| UC10 | User | View weekly problem-solving summary. |
| UC11 | User | View GitHub-style daily activity heatmap. |
| UC12 | System | Automatically calculate streak after logging a problem. |
| UC13 | System | Generate analytics data for dashboard views. |
| UC14 | User | Update current competitive programming rating manually. |

---
