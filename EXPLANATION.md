# Faithled Payment Dashboard Frontend

## Overview
This folder contains the complete frontend codebase for the Faithled International Academy Payment Dashboard. The frontend is built with React, Vite, Material UI, and custom CSS inspired by the provided mockup for a modern, user-friendly, and mobile-responsive experience.

## Key Features
- Dashboard with total students, per-class stats, debtors, scholarship count, editable tuition, and search.
- Students tab with search, filter, and inline editing of student info.
- Payments tab with search, filter, editable amount paid and date, and auto-calculated balances.
- Debtors tab with class categorization, copyable lists, and search.
- Dynamic navigation with the ability to add new payment/event tabs.
- All monetary values formatted as Naira (₦) with commas.
- All UI components styled to match the mockup for a sleek, modern look.

## Structure
- `src/components/`: All React components (Dashboard, Students, Payments, Debtors, NavBar, etc.)
- `src/mockData.ts`: Mock data for students, payments, sessions, etc. (used for development)
- `src/style.css`: Custom CSS for mockup-inspired design
- `index.html`, `vite.config.ts`, etc.: Vite project setup

## Integration
The frontend is designed to communicate with the backend via RESTful API endpoints for all student, payment, and session data. During development, the frontend uses mock data (`src/mockData.ts`).

### How to Integrate with Backend
1. **Switch to API Data:**
   - Replace imports from `mockData.ts` with API calls (using `fetch` or `axios`) to endpoints like `/api/students`, `/api/payments`, etc.
   - Example:
     ```js
     // Instead of: import { students } from './mockData';
     // Use:
     useEffect(() => {
       fetch('/api/students').then(res => res.json()).then(setStudents);
     }, []);
     ```
2. **Manual Data Entry:**
   - You can input real data from the frontend UI. This will be sent to the backend and, once the database is connected, will be persisted.
3. **Development Mode:**
   - The frontend works fully with mock data for rapid prototyping and UI testing.
   - When ready, simply point the frontend to the backend API for live data.

### API Endpoints Used
- `GET /api/students` — Fetch all students
- `POST /api/students` — Add a new student
- `GET /api/payments` — Fetch all payments
- `POST /api/payments` — Add or update a payment
- `GET /api/sessions` — Fetch academic sessions

See the backend `EXPLANATION.md` for more details on endpoints and integration.

## How to Run
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Access the dashboard at `http://localhost:3000`

---
See the main `PROJECT_OVERVIEW.md` for a full project summary.
