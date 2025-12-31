# MySQL Dashboard for AWS Amplify

A modern Next.js dashboard application for viewing data from MySQL tables, designed to run on AWS Amplify.

## Features

- 🎨 Modern, responsive dashboard UI
- 📊 Table data visualization
- 🔌 MySQL connection service with automatic table discovery
- 🔍 Automatically discovers and displays all tables ending with "_new_feed"
- ☁️ AWS Amplify ready
- ⚡ Built with Next.js 14 and React
- 🔒 Secure server-side database connections via API routes

## Project Structure

```
trepo_dash/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard page
│   ├── globals.css         # Global styles
│   └── api/
│       ├── health/         # Health check endpoint
│       ├── tables/         # Discover tables ending with "_new_feed"
│       └── tables/[tableName]/  # Fetch data from specific table
├── lib/
│   └── db.ts               # MySQL connection utility
├── services/
│   └── mysqlService.ts     # Client-side MySQL service (API calls)
├── amplify.yml             # AWS Amplify build configuration
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript configuration
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
DB_HOST=database-1.cvig8u6s25dz.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-mysql-password
DB_NAME=mysqlTutorial
```

**Important:** 
- The `DB_PASSWORD` must be set (it's not included in the config for security)
- For AWS Amplify, add these as environment variables in the Amplify Console under **App settings > Environment variables**
- The application will automatically discover all tables ending with `_new_feed` - no manual table configuration needed!

### 3. Database Configuration

The application is pre-configured with:
- **Host:** `database-1.cvig8u6s25dz.us-east-1.rds.amazonaws.com`
- **User:** `admin`
- **Database:** `mysqlTutorial`

You only need to set the `DB_PASSWORD` environment variable.

**Table Discovery:**
The dashboard automatically discovers and displays all tables in your database that end with `_new_feed`. No manual configuration required!

### 4. Local Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the dashboard.

### 5. Deploy to AWS Amplify

**Quick Start:**
1. Push your code to a Git repository (GitHub, GitLab, Bitbucket, or CodeCommit)
2. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
3. Click "New app" > "Host web app"
4. Connect your repository
5. **Add Environment Variables** (CRITICAL):
   - `DB_HOST` = `database-1.cvig8u6s25dz.us-east-1.rds.amazonaws.com`
   - `DB_USER` = `admin`
   - `DB_PASSWORD` = `<your-mysql-password>`
   - `DB_NAME` = `mysqlTutorial`
6. Click "Save and deploy"

**Detailed Instructions:** See [DEPLOY.md](./DEPLOY.md) for complete deployment guide.

**Note:** Amplify will automatically detect Next.js and use the `amplify.yml` configuration. Your app will auto-deploy on every git push!

## MySQL Service Implementation

The MySQL connection is fully implemented! The application:

1. **Automatically discovers** all tables ending with `_new_feed` in your database
2. **Fetches data** from each discovered table (up to 1000 rows per table)
3. **Displays data** in a clean, organized dashboard

### Architecture

- **Server-side connections** (`lib/db.ts`): Handles MySQL connections securely on the server
- **API routes** (`app/api/tables/`): Expose database operations via REST API
  - `GET /api/tables` - Discovers all tables ending with `_new_feed`
  - `GET /api/tables/[tableName]` - Fetches data from a specific table
- **Client service** (`services/mysqlService.ts`): Makes API calls from the frontend

### Database Access

The application connects to your MySQL database using:
- Host: `database-1.cvig8u6s25dz.us-east-1.rds.amazonaws.com`
- User: `admin`
- Database: `mysqlTutorial`
- Password: Set via `DB_PASSWORD` environment variable

**Security Note:** All database connections are made server-side through API routes. Database credentials never reach the client.

## Security Considerations

- **Never commit `.env.local`** - It's already in `.gitignore`
- Use AWS Secrets Manager or Amplify Environment Variables for production
- Implement proper authentication/authorization
- Use SSL/TLS for database connections
- Consider using AWS RDS with VPC for database security

## Next Steps

1. ✅ Project structure and shell code created
2. ✅ MySQL connection logic implemented
3. ✅ Automatic table discovery for tables ending with `_new_feed`
4. ⏳ Add authentication/authorization
5. ⏳ Add data filtering and search capabilities
6. ⏳ Add charts and visualizations
7. ⏳ Add real-time data updates
8. ⏳ Add pagination for large datasets

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **MySQL2** - MySQL client library
- **AWS Amplify** - Hosting and deployment

## License

MIT

