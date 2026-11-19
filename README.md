# Support Ticket System

A role based internal support ticket app. Employees create and track their own tickets, support agents manage ticket assignments and status, and admins can also manage user roles. Ticket comments and status changes are delivered to connected clients with Socket.IO.

## Stack

- **Frontend:** React 19, TypeScript, Vite, React Router, Tailwind CSS, Base UI shadcn components, TanStack Table, React Hook Form, Zod, Axios, Socket.IO Client.
- **Backend:** Node.js, Express 5, TypeScript, MongoDB with Mongoose, cookie based JWT authentication, Socket.IO.

## Repository layout

```text
backend/
  src/
    config/       MongoDB connection
    controllers/  Auth, ticket, and user request handlers
    middleware/   Authentication and role checks
    models/       Mongoose User and Ticket models
    routes/       REST API routes
    server.ts     Express and Socket.IO server entry point
    socket.ts     Authenticated socket rooms and event setup
    seed.ts       Local demo-user seeder
frontend/
  src/
    components/   Shared layout, ticket, select, and table components
    context/      Authentication state
    pages/        Login, registration, dashboard, tickets, and users
    services/     API requests
    routes/       Public and protected routes
```

## Requirements

- Node.js 20 or newer
- npm
- A MongoDB instance (local or hosted)

## Local setup

Open two terminals from the repository root.

1. Configure the backend:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Set `MONGO_URI` to a reachable MongoDB connection string and replace `JWT_SECRET` with a long, random secret.

2. Configure the frontend:

   ```bash
   cp frontend/.env.example frontend/.env
   ```

   Set `VITE_API_URL` to the backend API base URL. The local default is `http://localhost:5000/api`.

3. Install dependencies and start the backend:

   ```bash
   cd backend
   npm ci
   npm run dev
   ```

4. In the other terminal, install dependencies and start the frontend:

   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

   Open the Vite URL printed in the terminal (usually `http://localhost:5173`). `CLIENT_URL` in `backend/.env` must match the frontend origin for HTTP and Socket.IO credentialed requests.

## Demo accounts

To create local demo accounts, run this from `backend/` after configuring MongoDB:

```bash
npm run seed
```

The seeder creates these accounts if they do not already exist:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@test.com` | `Admin@123` |
| Agent | `agent@test.com` | `Agent@123` |
| Employee | `employee1@test.com` | `Employee@123` |
| Employee | `employee2@test.com` | `Employee@123` |

These are development-only credentials. Do not use them in a deployed environment.

## Roles and features

- **Employee:** Register, create tickets, view their own tickets, add comments, and receive a notification when a status changes on one of their tickets.
- **Agent:** View tickets, assign tickets to themselves, change ticket status, and comment.
- **Admin:** Agent permissions plus user list and role management. Admins receive notifications when comments are added.
- **All authenticated roles:** Dashboard overview, searchable/filterable ticket list, ticket details, and live comments/status updates while a ticket is open.

Ticket list views use TanStack Table. Lists and dashboard cards show skeletons during loading. Select controls use shared shadcn-style components.

## API overview

All REST endpoints are under `/api`. Authentication is stored in an HTTP-only `token` cookie; the frontend sends credentials with API and Socket.IO requests.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Register an employee account |
| `POST` | `/api/auth/login` | Public | Sign in |
| `POST` | `/api/auth/logout` | Authenticated | Sign out |
| `GET` | `/api/auth/me` | Authenticated | Get the current user |
| `GET` | `/api/tickets` | Authenticated | List tickets; employees only see their own. Supports `page`, `limit`, `search`, `status`, and `priority` query parameters |
| `GET` | `/api/tickets/:id` | Authenticated | Get ticket details |
| `POST` | `/api/tickets` | Employee | Create a ticket |
| `PATCH` | `/api/tickets/:id/assign` | Agent, admin | Assign a ticket to the current agent |
| `PATCH` | `/api/tickets/:id/status` | Agent, admin | Change ticket status |
| `POST` | `/api/tickets/:id/comments` | Authenticated | Add a comment |
| `GET` | `/api/users` | Admin | List users |
| `PATCH` | `/api/users/:id/role` | Admin | Change a user's role |

## Real-time events

Socket.IO shares the backend HTTP server and authenticates connections with the same session cookie.

- A client joins `ticket:<ticketId>` only after the server confirms the user may view that ticket.
- `ticket:status-updated` and `ticket:comment-added` update open ticket details pages.
- `notification:new` increments the header bell. Admins receive comment notifications; ticket owners receive status notifications. The bell panel shows recent event details and links to the ticket.

## Scripts

Run commands inside the relevant app directory.

### Backend (`backend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the TypeScript server with reload |
| `npm run build` | Compile TypeScript into `backend/dist` |
| `npm start` | Run the compiled server |
| `npm run seed` | Add local demo accounts |

### Frontend (`frontend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build in `frontend/dist` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Configuration

See [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example). Do not commit `.env` files or production secrets.
