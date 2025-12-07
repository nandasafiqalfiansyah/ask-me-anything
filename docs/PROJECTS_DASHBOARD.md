# Projects Dashboard Documentation

## Overview

The Projects Dashboard is a web-based interface for managing project MDX files in the `content/projects/` directory. It provides full CRUD (Create, Read, Update, Delete) operations with an integrated MDX editor.

## Features

### 1. **Create Projects**
- Fill in metadata fields (title, summary, tags, etc.)
- Write MDX content in a dedicated textarea
- Auto-generates frontmatter from metadata
- Validates slug format (kebab-case)
- Prevents duplicate slugs

### 2. **Edit Projects**
- Modify all project metadata
- Update MDX content
- Rename project (change slug)
- Real-time form validation

### 3. **Delete Projects**
- Confirmation dialog before deletion
- Removes MDX file from filesystem
- Updates UI immediately

### 4. **View Projects**
- Collapsible list view
- Shows title, slug, and publish date
- Preview of content and metadata
- Tags displayed as badges

## File Structure

```
app/
├── api/
│   └── v1/
│       └── projects/
│           └── route.ts          # API endpoints for CRUD operations
├── dashboard/
│   └── page.tsx                  # Dashboard with Projects tab
components/
├── crud-projects.tsx             # Projects management component
└── ui/
    └── collapsible.tsx           # Collapsible UI component
```

## API Endpoints

### GET `/api/v1/projects`
Fetches all projects from `content/projects/*.mdx`

**Response:**
```json
{
  "projects": [
    {
      "slug": "project-name",
      "metadata": {
        "title": "Project Title",
        "summary": "Description",
        "image": "/images/project.png",
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
Creates a new project

**Request Body:**
```json
{
  "slug": "my-project",
  "metadata": {
    "title": "My Project",
    "summary": "Description",
    "image": "/images/project.png",
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
- Title is required
- Content can be empty

### PUT `/api/v1/projects`
Updates an existing project

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
Deletes a project

**Request Body:**
```json
{
  "slug": "project-to-delete"
}
```

## MDX File Format

Projects are stored as MDX files in `content/projects/` with the following format:

```mdx
---
title: Project Title
summary: Short description
image: /images/projects/image.png
author: 'ndav'
tags: ['Next.js', 'React', 'TypeScript']
publishedAt: '2024-12-07'
---

## Your Project Content

Write your project description using Markdown/MDX syntax.

- Feature 1
- Feature 2

### Technologies Used

- Next.js
- React
```

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
   - **Image URL**: Path to project image
   - **Author**: Your name (defaults to 'ndav')
   - **Tags**: Comma-separated list (e.g., `Next.js, React, TypeScript`)
   - **Published Date**: Date in YYYY-MM-DD format
   - **Content**: MDX content using Markdown syntax
3. Click "Create Project"
4. The project will be saved and appear in the list

### Editing a Project

1. Click the "Edit" button on any project in the list
2. Modify the fields you want to change
3. You can also change the slug to rename the project
4. Click "Update Project" to save changes
5. Click "Cancel" to discard changes

### Deleting a Project

1. Click the "Delete" button on the project you want to remove
2. Confirm the deletion in the dialog
3. The project file will be permanently deleted

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
- File existence checks
- Duplicate slug prevention
- Missing directory handling

## Security

### Authentication
- Dashboard requires Supabase authentication
- Protected by session check

### Input Validation
- Slug regex: `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`
- Prevents path traversal
- Sanitizes file names

### File Operations
- All operations scoped to `content/projects/`
- Uses path.join() for security
- Validates file existence

## Troubleshooting

### Projects Not Loading
- Check if `content/projects/` directory exists
- Verify file permissions
- Check browser console for API errors

### Cannot Create Project
- Ensure slug follows kebab-case format
- Check if slug already exists
- Verify required fields are filled

### Cannot Update Project
- Ensure original project exists
- If renaming, check new slug is unique
- Verify content is valid MDX

## Best Practices

1. **Use descriptive slugs**: Make them SEO-friendly and meaningful
2. **Add relevant tags**: Help with categorization and filtering
3. **Include images**: Visual appeal improves engagement
4. **Write quality content**: Use proper Markdown formatting
5. **Keep slugs stable**: Avoid frequent changes to maintain URLs

## Future Enhancements

Potential improvements:
- Rich text MDX editor with syntax highlighting
- Image upload functionality
- Live MDX preview
- Bulk import/export
- Version history
- Search and filtering
- Drag-and-drop reordering

## Changelog

### v1.0.0 (2024-12-07)
- Initial release
- Full CRUD operations
- MDX editor integration
- Dashboard integration
- Collapsible list view
- Slug validation
- Error handling
- Security measures
