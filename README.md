🏢 Internal Company Social App

A full-stack JavaScript web app built for a single organization where only employees can join.
Designed as a homework project focusing on authentication, authorization, messaging, and clean structure.

🚀 Tech Stack

Backend: Node.js + Express

Database: SQLite + Prisma ORM

Frontend: Vanilla HTML/CSS/JS

Auth: Server-side sessions (express-session + SQLite store)

Security: bcrypt, Helmet, rate limiting

Sessions were chosen for simplicity and secure server-side authentication.

✅ Features

Company-only signup (@company.com)

Secure login & logout

Protected routes

User profile (view & edit)

Members directory with search (name, department, skills)

1:1 direct messaging

Conversations list + message threads

Online status (lastSeenAt)

User blocking (prevent messaging)

📂 Structure
internal-company-social-app/
├── prisma/
├── public/
├── src/
├── .env.example
├── package.json
└── README.md
🔑 Environment Variables

Create .env:

DATABASE_URL="file:./dev.db"
SESSION_SECRET="supersecretkey"
COMPANY_EMAIL_DOMAIN="company.com"
INVITE_CODE="INTERNAL2026"
PORT=3000
🛠 Setup
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
