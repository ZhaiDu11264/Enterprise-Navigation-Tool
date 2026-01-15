# Enterprise Navigation Tool

An enterprise internal website navigation management tool that provides a unified entry point for managing large numbers of internal and external websites.

## Features

- Multi-user support with role-based access control
- Card-based responsive navigation interface
- Website link management with automatic favicon extraction
- Group organization and drag-and-drop reordering
- Search and quick access functionality
- **Default configuration management with system-protected links**
- **Built-in internal office system links (non-deletable)**
- Import/export capabilities for bulk operations
- Comprehensive audit logging and system monitoring

## Default Configuration

The system comes with a pre-configured "内部办公" (Internal Office) group that includes:

- 公司网站 (Company Website): http://wm.czgm.com
- 协同办公系统(OA) (OA System): http://oa.czgm.com
- 人力资源系统(EHR) (HR System): http://ehr.czgm.com
- 电子邮件系统 (Email System): http://mail.czgm.com
- CRM系统 (CRM System): http://192.168.21.197

These links are automatically added to every new user account and cannot be deleted by regular users. Only administrators can modify the default configuration.

## Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MySQL 8.0
- **Authentication**: JWT with bcrypt
- **Frontend**: React 18 with TypeScript
- **Caching**: Redis (optional)

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database and other configuration details

5. Create the MySQL database:
   ```sql
   CREATE DATABASE enterprise_navigation;
   ```

6. Run database migrations:
   ```bash
   npm run migrate
   ```

7. Initialize default configuration:
   ```bash
   npm run init-config
   ```

## Development

Start the development server:
```bash
npm run dev
```

Build the project:
```bash
npm run build
```

Run tests:
```bash
npm test
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run init-config` - Initialize default configuration
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run validate` - Validate project setup

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user info
- `POST /api/auth/refresh` - Refresh JWT token

### Links Management
- `GET /api/links` - Get user's links
- `POST /api/links` - Create new link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link (only if deletable)
- `POST /api/links/:id/favorite` - Toggle favorite status
- `POST /api/links/:id/access` - Record link access

### Groups Management
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create new group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group (only if deletable)
- `POST /api/groups/reorder` - Reorder groups

### Admin Features
- `GET /api/admin/configurations` - Get all configurations
- `POST /api/admin/configurations` - Create configuration
- `PUT /api/admin/configurations/:id` - Update configuration
- `POST /api/admin/configurations/:id/activate` - Activate configuration
- `DELETE /api/admin/configurations/:id` - Delete configuration

## System Protection

The system includes protection mechanisms for critical data:

- **System Groups**: Groups marked as `isSystemGroup: true` cannot be deleted by users
- **System Links**: Links marked as `isSystemLink: true` cannot be deleted by users
- **Default Configuration**: Automatically applied to new users during registration
- **Admin Override**: Only administrators can modify system configurations

## Project Structure

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── models/          # Data models and services
├── routes/          # API route handlers
├── services/        # Business logic services
├── utils/          # Utility functions
├── app.ts          # Express app setup
└── server.ts       # Server entry point

database/
├── migrations/     # Database migration files
└── schema.sql     # Complete database schema

frontend/
├── src/
│   ├── components/ # React components
│   ├── services/   # API services
│   ├── types/      # TypeScript types
│   └── utils/      # Frontend utilities
└── public/         # Static assets
```

## Environment Variables

See `.env.example` for all available configuration options.

## License

MIT