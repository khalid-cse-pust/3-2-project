# Project Report: Student Hall Management System

## 1. Introduction
The Student Hall Management System is a digital solution designed to modernize the administration of university residential halls. In traditional systems, managing room allocations, student records, and maintenance requests often involves manual paperwork, leading to inefficiencies and delays. This application provides a centralized platform for students and administration to interact seamlessly.

## 2. Problem Statement
Manual hall management faces several challenges:
- Difficulty in tracking and managing residency applications.
- Delayed response to maintenance and facility problems reported by students.
- Lack of a centralized database for student residential records.
- Difficulty in searching and verifying student residency status in real-time.
- Risk of data loss and errors due to physical record-keeping.

## 3. Objectives
The primary objectives of this project are:
- To automate the residency application process.
- To provide a platform for reporting and tracking maintenance issues.
- To maintain a secure and searchable database of residential and non-residential students.
- To implement role-based access for students, staff, and administrators.
- To improve transparency and communication between students and hall management.

## 4. Scope of the Project
The scope of this project includes:
- **User Authentication:** Secure registration and login for all users.
- **Residency Management:** Handling applications, approvals, and student records.
- **Maintenance Tracking:** A ticketing system for reporting and resolving hall issues.
- **Administrative Control:** Dashboard for overview and management of hall operations.
- **Data Security:** Protecting user data and ensuring authorized access.

## 5. System Users
The system identifies three primary user roles:
1. **Students:** Can apply for residency, report problems, and view their dashboard.
2. **Staff:** Responsible for managing reported problems and updating their resolution status.
3. **Administrators (Admin):** Have full control over the system, including approving residency applications and managing user records.

## 6. System Modules & Features
### Student Module
- Residency Application Form (with document upload).
- Issue Reporting System (with image attachment).
- Personal Dashboard and Account Management.
### Admin Module
- Application Review & Approval Workflow.
- Residential/Non-residential Student Search.
- Statistical Overview Dashboard.
### Staff Module
- Problem Management System.
- Task Assignment and Status Tracking.

## 7. System Architecture
The application utilizes the **MERN Stack** (MongoDB, Express, React, Node.js):
- **Frontend:** React with TypeScript for a type-safe and interactive UI.
- **Backend:** Node.js and Express for handling business logic and API routing.
- **Database:** MongoDB for persistent and flexible data storage.
- **Middleware:** JWT for secure authentication and Multer for file storage.

## 8. Activity Diagram
*(Note: Represented textually)*
1. **User Login:** User enters credentials -> System validates -> Token issued.
2. **Apply for Hall:** Student fills form -> Uploads Document -> Admin reviews -> Approved/Rejected.
3. **Report Problem:** Student submits issue -> Staff views -> Assigns task -> Resolves issue -> Status updated.

## 9. ER Diagram (Entities and Relationships)
- **User Entity:** `_id`, `name`, `email`, `studentId`, `role`, `password`.
- **Application Entity:** `_id`, `user` (FK), `studentId`, `status`, `document`.
- **Problem Entity:** `_id`, `user` (FK), `category`, `description`, `status`, `image`.
- **Relationships:**
    - User **has one** Application.
    - User **can report many** Problems.

## 10. Project Structure Details
```text
D:\Student Hall Management System\
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic for routes
│   ├── middleware/      # Auth and file upload middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoint definitions
│   └── index.js         # Entry point
└── frontend/
    ├── src/
    │   ├── app/         # Main application logic
    │   ├── components/  # Reusable UI components
    │   ├── api.ts       # API service layer
    │   └── styles/      # Global CSS and themes
```

## 11. API Endpoints Summary
### Users
- `POST /api/users` - Register a new user.
- `POST /api/users/login` - Authenticate user & get token.
- `GET /api/users/profile` - Get current user profile.
### Applications
- `POST /api/applications` - Submit a residency application.
- `GET /api/applications` - Get applications (Admin/Student).
- `PUT /api/applications/:id` - Update application status (Admin).
### Problems
- `POST /api/problems` - Report a new issue.
- `GET /api/problems` - Get reported issues.
- `PUT /api/problems/:id` - Update problem status (Staff).

## 12. Software Requirements
- **Runtime:** Node.js (v18+).
- **Database:** MongoDB (Local or Atlas).
- **Frontend Build Tool:** Vite.
- **Package Manager:** npm or pnpm.
- **Styling:** Tailwind CSS.

## 13. Application Design
The application features a modern, clean design using:
- **Responsive Layouts:** Accessible on desktop and mobile.
- **Interactive UI:** Using shadcn/ui and Lucide icons.
- **Real-time Feedback:** Toast notifications and loading states.
- **Consistent Branding:** Professional color palette and typography.

## 14. System Maintenance
- **Regular Backups:** Periodic backup of MongoDB data.
- **Security Updates:** Keeping npm packages updated.
- **Log Monitoring:** Checking server logs for errors or suspicious activity.
- **Scalability:** The NoSQL structure allows for easy expansion of data fields.

## 15. Conclusion & Future Plan
The Student Hall Management System successfully provides a digital bridge between hall residents and administration.
**Future Plans include:**
- Integrating a payment gateway for hall fees.
- Real-time chat between students and staff.
- Automatic room allocation using an algorithm based on student CGPA or distance.
- Mobile application for even better accessibility.
