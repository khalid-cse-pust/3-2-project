# API Endpoint Summary

All API requests are prefixed with `/api`. Base URL: `http://localhost:5000` (development).

## 1. Authentication & Users
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/users` | Public | Register a new user/student. |
| POST | `/api/users/login` | Public | Login and receive JWT. |
| GET | `/api/users/profile` | Private | Get details of the logged-in user. |
| GET | `/api/users/search/:id` | Private | Search for a student by their University ID. |

## 2. Residency Applications
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/applications` | Student | Submit a new residency application. |
| GET | `/api/applications` | Private | Get user's applications (Student) or all (Admin). |
| PUT | `/api/applications/:id` | Admin | Update status (Approve/Reject) and add remarks. |

## 3. Problem Reporting
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/problems` | Student | Report a maintenance or facility issue. |
| GET | `/api/problems` | Private | Get user's reports (Student) or all (Staff/Admin). |
| PUT | `/api/problems/:id` | Staff | Update issue status or assign to staff. |

## Security & Headers
- **Authentication:** JWT Bearer Token required for Private/Admin/Staff routes.
- **Header:** `Authorization: Bearer <token>`
- **Content-Type:** `application/json` (or `multipart/form-data` for uploads).
