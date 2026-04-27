# TaskFlow – Full-Stack Project Management Platform

TaskFlow is a full-stack project management application built to help teams organize, track, and manage their work efficiently. It combines a Spring Boot backend with a modern React frontend and uses PostgreSQL for reliable data storage. The system is designed with secure authentication and role-based access control to support real-world team workflows.

Live Demo:
https://taskflow-ten-dusky.vercel.app/

Overview

The application supports three types of users: Admin, Manager, and User, each with different levels of access and responsibilities. Admins manage the system, managers handle task operations, and users focus on completing assigned work.

TaskFlow provides a clean and responsive interface where users can interact with tasks in real time. It ensures that only authorized users can perform specific actions, making the system both secure and practical for collaborative environments.

Key Features
Secure authentication using JWT-based login and registration
Role-based access control for Admin, Manager, and User
Full task management functionality (create, update, delete, and view tasks)
Interactive React dashboard with real-time state handling
Backend APIs built with Spring Boot for scalable and structured logic
PostgreSQL database for persistent and reliable data storage
Dockerized architecture for consistent and isolated environments
CI/CD integration using GitHub Actions for automated workflows
How the system works

When a user logs into TaskFlow, they are authenticated using JWT tokens. Based on their assigned role, they gain access to specific features within the application.

Managers and admins can create and manage tasks, assign them to users, and monitor progress. Regular users can view and update their assigned tasks. All operations are handled through secure backend APIs, and data is stored in PostgreSQL.

The frontend communicates with the backend seamlessly, providing a smooth user experience with dynamic updates and clear task visibility.
