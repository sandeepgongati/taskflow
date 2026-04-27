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
Technologies Used and How They Work Together

TaskFlow is designed using a layered architecture where each technology plays a specific role:

React (Frontend):
Handles the user interface and dashboard. It manages authentication state, displays tasks, and communicates with backend APIs.
Spring Boot (Backend):
Acts as the core of the application. It processes requests, applies business logic, manages users and tasks, and exposes REST APIs.
PostgreSQL (Database):
Stores all application data including users, roles, and tasks. Ensures data consistency and reliability.
JWT Authentication:
Secures the application by generating tokens after login. These tokens are used to verify users for every request.
Role-Based Access Control:
Restricts features based on user roles (Admin, Manager, User), ensuring proper authorization.
Docker:
Containerizes frontend, backend, and database so the application runs consistently across environments.
GitHub Actions (CI/CD):
Automates build and deployment workflows, helping maintain code quality and faster updates.
How the system works

When a user logs into TaskFlow, the backend verifies credentials and generates a JWT token. This token is used for all future requests to ensure secure communication.

Based on the user’s role, the system grants access to specific features. Managers and admins can create and manage tasks, assign them to users, and track progress. Regular users can view and update their assigned tasks.

All interactions between the frontend and backend happen through REST APIs, and the data is stored securely in PostgreSQL. The system is designed to be scalable, secure, and easy to use.
