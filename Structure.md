# 📦 Project Structure

This project follows a separated **Frontend–Backend architecture** using modern TypeScript tooling, with **Supabase** as the primary database service.

---

# 🖥️ Frontend

The frontend is built using React, Vite, and TailwindCSS. It is structured in a modular and scalable way to ensure maintainability and reusability.

## 📁 Directory Structure

frontend/
├── node_modules/
├── src/
│   ├── @types/          # TypeScript type definitions  
│   ├── api/             # API request handlers  
│   ├── assets/          # Static assets (images, icons, etc.)  
│   ├── components/      # Reusable UI components  
│   ├── hooks/           # Custom React hooks  
│   ├── pages/           # Application pages/views  
│   ├── routes/          # Routing configuration  
│   ├── templates/       # Layout templates  
│   ├── themes/          # Theme configurations  
│   ├── utils/           # Utility functions  
│   ├── validators/      # Form/input validation logic  
│   ├── app.tsx          # Main app component  
│   ├── main.tsx         # Application entry point  
│   └── vite-env.d.ts    # Vite environment typings  
├── .env                 # Environment variables  
├── .gitignore  
├── biome.json           # Code formatter/linter configuration  
├── index.html           # Root HTML file  
├── package.json  
├── readme.md  
└── tailwind.config.ts   # TailwindCSS configuration  

---

# ⚙️ Backend

The backend follows a clean architecture pattern and connects securely to Supabase for database operations.

## 📁 Directory Structure

backend/
├── node_modules/
├── src/
│   ├── @types/          # TypeScript type definitions  
│   ├── config/          # Supabase client configuration  
│   ├── controllers/     # Request handlers  
│   ├── helpers/         # Helper functions  
│   ├── middlewares/     # Express middlewares  
│   ├── models/          # Data models (if applicable)  
│   ├── routes/          # API route definitions  
│   ├── services/        # Business logic layer  
│   ├── validators/      # Request validation logic  
│   └── server.ts        # Server entry point  
├── .env                 # Supabase credentials  
├── .gitignore  
├── biome.json  
├── package.json  
├── readme.md  
├── tsconfig.json        # TypeScript configuration  
├── docker-compose.yml   # Docker configuration (optional)  
└── Dockerfile           # Docker image definition  

---

# 🗄️ Database

The system uses **Supabase (PostgreSQL)** as its database service.

## Environment Variables Example

SUPABASE_URL= https://hyvnawfimtcyxuqgpuap.supabase.co
SUPABASE_ANON_KEY= eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5dm5hd2ZpbXRjeXh1cWdwdWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MzYxMTgsImV4cCI6MjA4NzExMjExOH0.dP4eqCH1Q83iAdzv0Xz5N5yPJ87y2Rz8UBAk3XSFdZc
SUPABASE_SERVICE_ROLE_KEY= eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5dm5hd2ZpbXRjeXh1cWdwdWFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTUzNjExOCwiZXhwIjoyMDg3MTEyMTE4fQ.UzAWUAa52HEDx5jwe-Vy4BmXdI5oxOmPw14BDtZkNOY

---

#🏗️ System Architecture

- Frontend handles the user interface and sends API requests.
- Backend processes requests and applies business logic.
- Supabase manages the PostgreSQL database and authentication.
- Docker (optional) supports containerized deployment.

---

# 🚀 Setup Instructions

## Frontend

1. Navigate to the frontend folder:
   npm install
   npm run dev

## Backend

1. Navigate to the backend folder:
   npm install
   npm run dev

Make sure your `.env` files are properly configured before running the application.

---

# 📌 Notes

- Ensure Supabase project credentials are kept secure.
- Use the Service Role Key only on the backend.
- Enable Row Level Security (RLS) in Supabase for production.