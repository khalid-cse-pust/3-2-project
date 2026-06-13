# Database Documentation: Student Hall Management System

The system uses **MongoDB** as its primary database, managed through the **Mongoose ODM**.

## Entities & Schemas

### 1. User Schema (`User.js`)
Stores authentication and profile information for all users.
- `name` (String, Required): Full name of the user.
- `email` (String, Required, Unique): Primary contact and login credential.
- `studentId` (String, Unique, Sparse): University ID for students.
- `department` (String): Academic department.
- `roomNumber` (String): Allocated room (for residents).
- `isResidential` (Boolean): Status of residency.
- `password` (String, Required): Hashed password (Bcrypt).
- `role` (String): Enum `['student', 'admin', 'staff']`. Default: `student`.
- `timestamps`: Automatically manages `createdAt` and `updatedAt`.

### 2. Application Schema (`Application.js`)
Tracks residency requests submitted by students.
- `user` (ObjectId): Reference to the `User` who applied.
- `studentId` (String): Student's university ID.
- `studentName` (String): Name of the applicant.
- `email/phone` (String): Contact details.
- `program/year` (String): Academic details.
- `guardianName/phone` (String): Emergency contact.
- `address` (String): Permanent address.
- `document` (String): Path/URL to the uploaded verification document.
- `status` (String): Enum `['pending', 'approved', 'rejected']`.
- `remarks` (String): Admin notes.

### 3. Problem Schema (`Problem.js`)
Manages maintenance and facility issues reported by residents.
- `user` (ObjectId): Reference to the reporting `User`.
- `studentId/Name` (String): Reporter details.
- `roomNumber` (String): Location of the issue.
- `category` (String): Type of problem (e.g., Plumbing, Electrical).
- `description` (String): Detailed explanation.
- `image` (String): Path/URL to the issue photo.
- `status` (String): Enum `['pending', 'assigned', 'in-progress', 'resolved']`.
- `assignedTo` (String): Name of the staff member handling it.
- `staffRemarks` (String): Staff updates.
