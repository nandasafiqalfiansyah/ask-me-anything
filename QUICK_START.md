# Quick Start: Fix Projects Not Appearing

## Problem
❌ Projects page is empty  
❌ Recent Projects section is empty

## Why?
The application migrated to Supabase database, but the database is empty.

## Solution (Choose One)

### Option 1: SQL Migration (Recommended) ⭐

```bash
npm run mig
```

This will:
- ✅ Apply all database migrations
- ✅ Populate projects table with 3 existing projects
- ✅ Set up correct sort order

### Option 2: Node.js Script

```bash
npm run seed:projects
```

This will:
- ✅ Read MDX files from content/projects/
- ✅ Insert them into database via API
- ✅ Skip duplicates if already exists

## Verify It Works

### 1. Check Database
Open Supabase Dashboard → Table Editor → `projects`
- Should see 3 rows: moneo-app, anak-sehat, histo-talk

### 2. Check Website
- Visit `/projects` → Should see 3 project cards
- Visit `/` homepage → Should see "Recent Projects" section with 2 cards

## Need Help?
- Read: `PROJECTS_FIX_GUIDE.md` for detailed troubleshooting
- Read: `SOLUTION_SUMMARY.md` for technical details
- Read: `docs/MIGRATION_GUIDE.md` for complete migration guide

## What Changed?

```
Before:
content/projects/*.mdx  →  [Application reads files]  →  Display projects
                               ❌ NOT WORKING ANYMORE

After:
content/projects/*.mdx  →  [Migration/Script]  →  Supabase Database  →  Display projects
                                                          ✅ WORKING
```

## Files Added

1. `supabase/migrations/20251207102600_seed_projects.sql` - Auto-populates database
2. `scripts/seed-projects.js` - Manual population script
3. `PROJECTS_FIX_GUIDE.md` - Detailed guide
4. `SOLUTION_SUMMARY.md` - Technical summary

## Files Modified

1. `package.json` - Added `seed:projects` command
2. `README.md` - Added seeding instructions

## That's It! 🎉

Run `npm run mig` and your projects will appear!
