# System Architecture

The Student Hall Management System is built using a **decoupled Client-Server architecture**, specifically following the **MERN Stack** pattern.

## High-Level Architecture
1.  **Frontend (Presentation Layer):**
    - Built with **React** and **TypeScript**.
    - Uses **Vite** for fast builds and optimized delivery.
    - Handles user interactions, state management, and routing.
    - Communicates with the backend via **Axios/REST APIs**.

2.  **Backend (Application Layer):**
    - Built with **Node.js** and **Express.js**.
    - Implements **RESTful API** design principles.
    - Handles business logic (Authentication, Application processing, Issue tracking).
    - Manages file uploads using **Multer**.
    - Uses **JWT (JSON Web Tokens)** for stateless session management.

3.  **Database (Data Layer):**
    - **MongoDB** (NoSQL) stores all persistent data.
    - **Mongoose** provides a schema-based solution to model application data.
    - Handles complex relationships between Users, Applications, and Maintenance records.

## Key Design Patterns
- **Controller-Service-Repository:** Logic is separated into Routes (endpoints) and Controllers (logic).
- **Middleware Pattern:** Used for Authentication, Role-checking, and Error handling.
- **Component-Based UI:** Modular React components for high reusability.

## Technology Summary
- **Language:** TypeScript/JavaScript
- **Styling:** Tailwind CSS (Utility-first)
- **Security:** Bcrypt (Hashing), JWT (Auth)
- **Deployment:** Ready for cloud platforms like Heroku/Vercel or local servers.
