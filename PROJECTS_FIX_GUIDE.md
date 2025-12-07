# Fix Guide: Projects Page Not Showing Content

## Problem Description

The projects page (`/projects`) and the "Recent Projects" section on the homepage were not displaying any content. This was because:

1. The application was recently migrated from file-based MDX projects to a Supabase database
2. The database table `projects` exists, but it was empty
3. The old MDX files in `content/projects/` are no longer being read by the application

## Solution Implemented

Two methods have been provided to populate the projects database with the existing MDX content:

### Method 1: SQL Migration (Recommended)

A SQL migration file has been created that will automatically populate the projects table:

**File**: `supabase/migrations/20251207102600_seed_projects.sql`

This migration includes INSERT statements for all three existing projects:
- `moneo-app` (Moneo App)
- `anak-sehat` (Anaksehat Web App)
- `histo-talk` (Histotalk Web App)

**To apply this migration:**

```bash
npm run mig
```

This will run `supabase db push` which applies all pending migrations to your Supabase database.

### Method 2: Node.js Seed Script

An alternative Node.js script has been created that reads the MDX files and populates the database via the Supabase REST API.

**File**: `scripts/seed-projects.js`

This script:
- Reads all `.mdx` files from `content/projects/`
- Parses the frontmatter and content
- Inserts each project into the database using the Supabase REST API

**To run this script:**

```bash
npm run seed:projects
```

**Prerequisites:**
- You must have a `.env.local` file with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Verification Steps

After applying either method, verify the fix by:

1. **Check the database directly:**
   - Open your Supabase dashboard
   - Navigate to Table Editor → projects
   - Verify that 3 rows exist with slugs: `moneo-app`, `anak-sehat`, `histo-talk`

2. **Check the Projects page:**
   - Navigate to `/projects` on your website
   - You should see 3 project cards displayed

3. **Check the Homepage:**
   - Navigate to the homepage (`/`)
   - Scroll to the "Recent Projects" section
   - You should see 2 projects displayed (limited to 2 by the component)

## What Was Changed

### Files Added:
1. `supabase/migrations/20251207102600_seed_projects.sql` - SQL migration to seed projects
2. `scripts/seed-projects.js` - Node.js script to seed projects via API

### Files Modified:
1. `package.json` - Added `seed:projects` script
2. `README.md` - Added instructions for seeding projects data

### Dependencies Added:
1. `dotenv` - Required for the seed script to read environment variables

## Technical Details

### How the Projects System Works

1. **Data Storage**: Projects are stored in the `projects` table in Supabase
2. **Data Retrieval**: The `lib/projects.ts` file contains functions that query Supabase
3. **Display Components**:
   - `components/projects.tsx` - Displays a list of projects
   - `components/recent-projects.tsx` - Shows recent projects on homepage
   - `app/projects/page.tsx` - Projects page
   - `components/crud-projects.tsx` - Dashboard CRUD interface

### Project Data Structure

Each project has:
- `slug` (unique identifier, used in URLs)
- `title`
- `summary`
- `image_url`
- `author`
- `tags` (array)
- `published_at` (date)
- `content` (MDX content)
- `sort_order` (for ordering)
- `created_at`, `updated_at` (timestamps)

## Troubleshooting

### If projects still don't show:

1. **Check Supabase connection:**
   ```bash
   # Verify environment variables are set
   cat .env.local | grep SUPABASE
   ```

2. **Check database:**
   - Log into Supabase dashboard
   - Go to Table Editor
   - Check if `projects` table exists and has data

3. **Check browser console:**
   - Open browser DevTools
   - Look for any error messages
   - Check Network tab for failed API calls

4. **Check API endpoint:**
   - The API endpoint `/api/v1/projects` should return project data
   - Test it: `curl http://localhost:3000/api/v1/projects`

### Common Issues:

**Issue**: "Table doesn't exist"
- **Solution**: Run `npm run mig` to apply migrations

**Issue**: "Failed to fetch projects"
- **Solution**: Check environment variables and Supabase credentials

**Issue**: "Projects already exist" warning when seeding
- **Solution**: This is normal if projects were already inserted. The migration uses `ON CONFLICT DO NOTHING` to prevent duplicates.

## Future Management

Going forward, you can manage projects through:

1. **Dashboard UI**: Navigate to `/dashboard` → Projects tab
2. **Direct database editing**: Use Supabase dashboard
3. **API calls**: Use the `/api/v1/projects` endpoint

The old MDX files in `content/projects/` are no longer used by the application but can be kept as a backup.

## Additional Documentation

For more detailed information, see:
- [MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md) - Complete migration guide
- [PROJECTS_DASHBOARD.md](docs/PROJECTS_DASHBOARD.md) - Dashboard documentation
- [SUPABASE_PROJECTS_IMPLEMENTATION.md](docs/SUPABASE_PROJECTS_IMPLEMENTATION.md) - Technical implementation details
