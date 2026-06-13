# Project File Structure

```text
D:\Student Hall Management System\
├── backend/                   # Node.js + Express Backend
│   ├── config/                # Configuration (Database connection)
│   ├── controllers/           # Route handlers (Business logic)
│   ├── middleware/            # Auth guards & file upload logic
│   ├── models/                # Mongoose Database Schemas
│   ├── routes/                # API endpoint definitions
│   ├── uploads/               # Local storage for images/docs
│   ├── .env                   # Environment variables (Secrets)
│   ├── index.js               # Main entry point
│   └── package.json           # Backend dependencies
│
└── frontend/                  # React + TypeScript Frontend
    ├── public/                # Static assets
    ├── src/
    │   ├── api.ts             # Axios/Fetch API configuration
    │   ├── main.tsx           # Frontend entry point
    │   ├── app/               # Main application logic
    │   │   ├── App.tsx        # Root component & Routing
    │   │   ├── components/    # Feature components (Login, Dashboards)
    │   │   └── ui/            # Reusable shadcn/ui components
    │   ├── styles/            # CSS & Tailwind configurations
    │   └── assets/            # Global images & icons
    ├── tailwind.config.js     # Tailwind CSS settings
    ├── vite.config.ts         # Vite build settings
    └── package.json           # Frontend dependencies
```
