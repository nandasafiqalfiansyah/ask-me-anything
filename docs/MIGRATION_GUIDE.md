# Migration Guide: Projects to Supabase

This guide explains how to migrate your existing file-based projects to the new Supabase database and storage system.

## Overview

The project management system has been migrated from:
- **Before**: Static MDX files in `content/projects/` directory
- **After**: Dynamic Supabase database with image storage

## Benefits of Migration

1. **Dynamic Content**: No rebuild required to add/edit projects
2. **Better Performance**: Database queries are faster than filesystem reads
3. **Image Management**: Centralized storage with automatic cleanup
4. **Scalability**: Can handle thousands of projects efficiently
5. **Real-time Updates**: Changes reflect immediately
6. **Better Security**: Row-level security policies available

## Prerequisites

Before starting the migration:

1. ✅ Supabase project configured
2. ✅ Environment variables set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. ✅ Database migrations run
4. ✅ Storage bucket `project-images` created

## Step-by-Step Migration

### 1. Run Database Migration

```bash
npm run mig
```

This creates the `projects` table with the required schema.

### 2. Create Storage Bucket

In Supabase Dashboard or via SQL:

```sql
insert into storage.buckets (id, name, public) 
values ('project-images', 'project-images', true)
on conflict (id) do nothing;
```

### 3. Verify Table Structure

Check that the `projects` table exists with these columns:
- `id` (serial, primary key)
- `slug` (text, unique, not null)
- `title` (text, not null)
- `summary` (text)
- `image_url` (text)
- `author` (text, default 'ndav')
- `tags` (text[])
- `published_at` (date, not null)
- `content` (text, not null)
- `sort_order` (integer, default 0)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 4. Manual Migration of Existing Projects

For each MDX file in `content/projects/`:

#### Option A: Via Dashboard (Recommended for small numbers)

1. Open each MDX file
2. Navigate to `/dashboard` → Projects tab
3. Click "Create New Project"
4. Copy metadata and content from MDX file
5. If there are local images, upload them using the image upload feature
6. Click "Create Project"

#### Option B: Via API (For bulk migration)

Create a migration script:

```javascript
// scripts/migrate-projects.js
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const projectsDir = path.join(process.cwd(), 'content', 'projects')
const files = fs.readdirSync(projectsDir)

for (const file of files) {
  if (!file.endsWith('.mdx')) continue
  
  const slug = file.replace(/\.mdx$/, '')
  const filePath = path.join(projectsDir, file)
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContent)
  
  // Create project via API
  const response = await fetch('http://localhost:3000/api/v1/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug,
      metadata: {
        title: data.title,
        summary: data.summary,
        image: data.image,
        author: data.author || 'ndav',
        tags: data.tags || [],
        publishedAt: data.publishedAt
      },
      content
    })
  })
  
  const result = await response.json()
  console.log(`Migrated: ${slug}`, result)
}
```

Run the script:
```bash
node scripts/migrate-projects.js
```

### 5. Migrate Images

If your projects use local images in `/public/images/projects/`:

1. Upload each image via the dashboard's image upload feature
2. Or use Supabase CLI to bulk upload:

```bash
supabase storage cp /public/images/projects/* project-images/
```

3. Update the `image_url` in the database to point to new Supabase URLs

### 6. Verify Migration

1. Open your website and navigate to `/projects`
2. Verify all projects are displayed correctly
3. Click on individual projects to check content
4. Check that images load properly
5. Test project creation/editing in dashboard

### 7. Clean Up (Optional)

Once you've verified everything works:

1. **Backup** the old MDX files (just in case):
   ```bash
   tar -czf content-projects-backup.tar.gz content/projects/
   ```

2. Remove old MDX files:
   ```bash
   rm -rf content/projects/*.mdx
   ```

3. You can keep the directory for other purposes or remove it entirely

## Rollback Plan

If you need to rollback:

1. Restore MDX files from backup
2. Revert code changes to previous version
3. The database and storage won't interfere with file-based system

## Common Issues

### Issue: Projects not loading

**Solution**: 
- Check Supabase connection
- Verify environment variables
- Check browser console for errors

### Issue: Images not displaying

**Solution**:
- Verify storage bucket is public
- Check image URLs are correct
- Ensure CORS is configured if needed

### Issue: Migration script fails

**Solution**:
- Check API endpoint is running
- Verify authentication if required
- Check for duplicate slugs

## Post-Migration Tasks

- [ ] Update documentation links
- [ ] Update deployment scripts if needed
- [ ] Update CI/CD pipelines
- [ ] Test all CRUD operations
- [ ] Verify search/filtering still works
- [ ] Update team documentation

## Support

If you encounter issues:
1. Check the [Troubleshooting section](PROJECTS_DASHBOARD.md#troubleshooting)
2. Review Supabase logs
3. Check API endpoint responses
4. Verify database permissions

## Additional Notes

- The old `lib/projects.ts` functions still work but now query the database
- API endpoints maintain backward compatibility
- Frontend components automatically use new system
- No changes needed to pages that display projects
