# School Fee Management System

A concurrent school fee submission SaaS system built with Fullstack JavaScript, designed to handle simultaneous financial transactions with robust authentication and user-friendly interfaces.

## Features

- Admin and Parent dashboards
- Student management
- Fee structure configuration
- Payment processing with concurrency support
- Payment history and reporting
- User authentication (admin/parent roles)

## Prerequisites

- Node.js 18+ (20.x recommended)
- PostgreSQL database
- npm or yarn

## Installation

1. Extract the ZIP/RAR file to a directory
2. Open a terminal and navigate to the extracted directory
3. Install dependencies:

```bash
npm install
```

## Database Setup

1. Create a PostgreSQL database
2. Set up the environment variables (see Configuration section)
3. Run database migrations:

```bash
npm run db:push
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/schoolfees
SESSION_SECRET=your-session-secret
```

Replace `username`, `password` and `schoolfees` with your PostgreSQL credentials.

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## Default Users

The system comes with two default users:

1. Admin:
   - Email: admin@example.com
   - Password: adminadmin

2. Parent:
   - Email: parent@example.com
   - Password: parentparent

## Application Structure

- `/client` - Frontend React application
- `/server` - Backend Express API
- `/shared` - Shared types and schemas
- `/drizzle` - Database migrations

## License

MIT