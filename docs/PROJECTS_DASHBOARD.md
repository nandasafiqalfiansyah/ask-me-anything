# Projects Dashboard Documentation

## Overview

The Projects Dashboard is a web-based interface for managing projects dynamically using **Supabase database and storage**. It provides full CRUD (Create, Read, Update, Delete) operations with an integrated MDX editor and image upload capabilities.

## Features

### 1. **Create Projects**
- Fill in metadata fields (title, summary, tags, etc.)
- Write MDX content in a dedicated textarea
- Upload project images to Supabase storage
- Validates slug format (kebab-case)
- Prevents duplicate slugs
- Stores all data in Supabase database

### 2. **Edit Projects**
- Modify all project metadata
- Update MDX content
- Upload new project images
- Rename project (change slug)
- Real-time form validation

### 3. **Delete Projects**
- Confirmation dialog before deletion
- Removes project from database
- Automatically deletes associated images from storage
- Updates UI immediately

### 4. **View Projects**
- Collapsible list view
- Shows title, slug, and publish date
- Preview of content and metadata
- Tags displayed as badges
- Image preview links

## File Structure

```
app/
├── api/
│   └── v1/
│       └── projects/
│           ├── route.ts          # API endpoints for CRUD operations
│           └── upload/
│               └── route.ts      # Image upload endpoint
├── dashboard/
│   └── page.tsx                  # Dashboard with Projects tab
components/
├── crud-projects.tsx             # Projects management component
└── ui/
    └── collapsible.tsx           # Collapsible UI component
lib/
└── projects.ts                   # Supabase queries for projects
supabase/
└── migrations/
    └── 20251207081835_add_db_projects.sql  # Database schema
```

## API Endpoints

### GET `/api/v1/projects`
Fetches all projects from Supabase database

**Response:**
```json
{
  "projects": [
    {
      "slug": "project-name",
      "metadata": {
        "title": "Project Title",
        "summary": "Description",
        "image": "https://...supabase.co/storage/v1/object/public/project-images/...",
        "author": "ndav",
        "tags": ["Next.js", "React"],
        "publishedAt": "2024-12-07"
      },
      "content": "## MDX Content..."
    }
  ]
}
```

### POST `/api/v1/projects`
Creates a new project in the database

**Request Body:**
```json
{
  "slug": "my-project",
  "metadata": {
    "title": "My Project",
    "summary": "Description",
    "image": "https://...supabase.co/storage/v1/object/public/project-images/...",
    "author": "ndav",
    "tags": ["Next.js"],
    "publishedAt": "2024-12-07"
  },
  "content": "## Project content..."
}
```

**Validations:**
- Slug must be kebab-case (lowercase, numbers, hyphens)
- Slug must be unique
- Title and publishedAt are required
- Content can be empty

### PUT `/api/v1/projects`
Updates an existing project in the database

**Request Body:**
```json
{
  "slug": "current-slug",
  "newSlug": "new-slug",  // optional, for renaming
  "metadata": { /* updated metadata */ },
  "content": "updated content"
}
```

### DELETE `/api/v1/projects`
Deletes a project from database and removes associated images

**Request Body:**
```json
{
  "slug": "project-to-delete"
}
```

### POST `/api/v1/projects/upload`
Uploads an image to Supabase storage

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with `file` field

**Validations:**
- File type must be image (JPEG, PNG, GIF, WebP)
- Max file size: 5MB

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "url": "https://...supabase.co/storage/v1/object/public/project-images/timestamp.png",
  "fileName": "timestamp.png"
}
```

## Database Schema

Projects are stored in the Supabase `projects` table with the following structure:

```sql
create table projects (
  id serial primary key,
  slug text not null unique,
  title text not null,
  summary text,
  image_url text,
  author text default 'ndav',
  tags text[],                    -- Array of tags
  published_at date not null,
  content text not null,          -- MDX content
  sort_order integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

**Indexes:**
- `projects_slug_idx` on `slug`
- `projects_sort_order_idx` on `sort_order`
- `projects_published_at_idx` on `published_at desc`

## Storage Bucket

Project images are stored in the `project-images` Supabase storage bucket:
- Bucket name: `project-images`
- Public access: Yes
- File types: Images (JPEG, PNG, GIF, WebP)
- Max file size: 5MB

## Usage Guide

### Accessing the Dashboard

1. Navigate to `/dashboard` (requires authentication)
2. Click on the "Projects" tab in the navigation
3. You'll see a list of existing projects

### Creating a New Project

1. Click the "Create New Project" button
2. Fill in the form fields:
   - **Slug**: URL-friendly identifier (e.g., `my-awesome-project`)
   - **Title**: Display name for the project
   - **Summary**: Brief description
   - **Image**: Enter URL or upload an image file
     - Choose a file to upload directly to Supabase storage
     - Or paste an external URL
   - **Author**: Your name (defaults to 'ndav')
   - **Tags**: Comma-separated list (e.g., `Next.js, React, TypeScript`)
   - **Published Date**: Date in YYYY-MM-DD format
   - **Content**: MDX content using Markdown syntax
3. Click "Create Project"
4. The project will be saved to the database and appear in the list

### Editing a Project

1. Click the "Edit" button on any project in the list
2. Modify the fields you want to change
3. Upload a new image if desired
4. You can also change the slug to rename the project
5. Click "Update Project" to save changes to database
6. Click "Cancel" to discard changes

### Deleting a Project

1. Click the "Delete" button on the project you want to remove
2. Confirm the deletion in the dialog
3. The project will be permanently deleted from the database
4. Associated images in Supabase storage will be automatically removed

### Viewing Project Details

1. Click anywhere on a project row to expand it
2. View the summary, tags, and content preview
3. Click again to collapse

## Component Integration

### In Dashboard Page

```tsx
import CrudProjects from '@/components/crud-projects'

// In your component
{active === 'projects' && (
  <div className='rounded-2xl border p-6'>
    <CrudProjects />
  </div>
)}
```

### Standalone Usage

```tsx
import CrudProjects from '@/components/crud-projects'

export default function ProjectsManager() {
  return <CrudProjects />
}
```

## Error Handling

### Client-Side Validation
- Slug must follow kebab-case format
- Required fields must be filled
- HTTP errors are displayed clearly

### Server-Side Validation
- Slug format validation (regex)
- Database uniqueness checks
- Duplicate slug prevention
- Required field validation

## Security

### Authentication
- Dashboard requires Supabase authentication
- Protected by session check
- Service role key used for admin operations

### Input Validation
- Slug regex: `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`
- File type validation for uploads
- File size limits enforced (5MB)
- SQL injection prevention via Supabase client

### Storage Security
- Images stored in public Supabase bucket
- Unique filenames prevent collisions
- Automatic cleanup on project deletion
- Content-Type validation

## Troubleshooting

### Projects Not Loading
- Verify Supabase connection is configured
- Check if `projects` table exists in database
- Ensure migration has been run
- Check browser console for API errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### Cannot Create Project
- Ensure slug follows kebab-case format
- Check if slug already exists in database
- Verify required fields are filled (title, publishedAt)
- Check Supabase service role key is configured

### Cannot Update Project
- Ensure original project exists in database
- If renaming, check new slug is unique
- Verify content is valid MDX
- Check database permissions

### Image Upload Fails
- Verify `project-images` storage bucket exists
- Check bucket is set to public
- Ensure file is under 5MB
- Verify file type is a valid image format

## Best Practices

1. **Use descriptive slugs**: Make them SEO-friendly and meaningful
2. **Add relevant tags**: Help with categorization and filtering
3. **Upload images**: Use Supabase storage for better performance and management
4. **Write quality content**: Use proper Markdown formatting
5. **Keep slugs stable**: Avoid frequent changes to maintain URLs
6. **Compress images**: Before uploading for better performance

## Migration from File-based System

If you have existing MDX files in `content/projects/`, you can migrate them to the database:

1. Run the migration to create the `projects` table
2. Create the `project-images` storage bucket
3. For each MDX file:
   - Parse the frontmatter and content
   - Upload any local images to Supabase storage
   - Insert the project into the database via API
   - Verify the project displays correctly
4. Once verified, you can remove the old MDX files

## Future Enhancements

Potential improvements:
- ✅ Image upload functionality (implemented)
- Rich text MDX editor with syntax highlighting
- Live MDX preview
- Bulk import/export
- Version history
- Search and filtering
- Drag-and-drop reordering
- Image compression on upload
- Multiple image support per project

## Changelog

### v2.0.0 (2024-12-07)
- **BREAKING**: Migrated from filesystem to Supabase database
- Added Supabase storage integration for images
- Added image upload endpoint
- Improved security with service role authentication
- Added automatic image cleanup on deletion
- Updated API to use database operations
- Added sort_order field for future drag-and-drop
- Enhanced error handling

### v1.0.0 (2024-12-07)
- Initial release
- Full CRUD operations
- MDX editor integration
- Dashboard integration
- Collapsible list view
- Slug validation
- Error handling
- Security measures
