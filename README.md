# ask-me-anything

I am a back-end developer that does a lot of serverless things in AWS. You can
find out more about me here or on https://ndav.my.id/.

Got a question for me? Throw it into a
[discussion topic](https://github.com/nandasafiqalfiansyah/ask-me-anything/discussions)
and I'll try to get back to you as soon as possible!

Interested in seeing a code example from me? Add an
[issue](https://github.com/nandasafiqalfiansyah/ask-me-anything/issues) or
upvote one to request one!

## Question Ideas

- Ask me about a
  [Serverless Framework plugin I maintain](https://github.com/search?q=user%3Aneverendingqs+topic%3Aserverless-plugin&type=repositories)
  or about plugins in general
- I like poking around with
  [GitHub Actions](https://github.com/search?q=user%3Aneverendingqs+topic%3Agithub-actions&type=repositories)
  and have a set of personal
  [workflow templates](https://github.com/nandasafiqalfiansyah/.github/tree/master/workflow-templates)
  I maintain

## Setup for New Features

This project includes a dashboard for managing your portfolio content including Skills, Experiences, Education, and Users.

### Database Setup

After deploying to Supabase, you'll need to:

1. Run the database migrations:
   ```bash
   npm run mig
   ```

2. Create storage buckets in Supabase Dashboard:
   - Create `experience-logos` bucket (set as public)
   - Create `education-logos` bucket (set as public)
   - Create `certificate-images` bucket (set as public)
   - Create `certificate-pdfs` bucket (set as public)
   - Create `project-images` bucket (set as public)
   
   Or run these SQL commands in your Supabase SQL editor:
   ```sql
   insert into storage.buckets (id, name, public) 
   values ('experience-logos', 'experience-logos', true);
   
   insert into storage.buckets (id, name, public) 
   values ('education-logos', 'education-logos', true);
   
   insert into storage.buckets (id, name, public) 
   values ('certificate-images', 'certificate-images', true);
   
   insert into storage.buckets (id, name, public) 
   values ('certificate-pdfs', 'certificate-pdfs', true);
   
   insert into storage.buckets (id, name, public) 
   values ('project-images', 'project-images', true);
   ```

3. Configure RLS (Row Level Security) policies for the storage buckets if needed.

4. Seed the projects data:
   
   **Option A - Using SQL migration (Recommended):**
   The migration file `20251207102600_seed_projects.sql` will automatically populate the projects table with existing MDX content when you run `npm run mig`.
   
   **Option B - Using the seed script:**
   If you prefer to use the API-based seeding script:
   ```bash
   npm run seed:projects
   ```
   
   This will read all MDX files from `content/projects/` and insert them into the database.

### Dashboard Features

Access the dashboard at `/dashboard` (requires authentication):

- **Overview**: Dashboard statistics with interactive charts
  - Real-time statistics for all content types
  - Bar chart for content distribution
  - Pie chart for skills by category
  - Line chart for certificate acquisition timeline
  - Quick insights and metrics
- **Skills**: Manage your tech stack skills
- **Experiences**: Manage work experience entries with drag & drop ordering
- **Education**: Manage education entries with drag & drop ordering
- **Certificates**: Manage certificates with image and PDF upload support
  - Upload certificate images or PDFs
  - Group by company/issuer
  - Drag & drop reordering
- **Projects**: Manage projects dynamically with Supabase database and storage
  - Create, edit, and delete projects
  - MDX content editor with live preview
  - Full metadata management (title, summary, tags, etc.)
  - Image upload to Supabase storage
  - Slug validation and renaming support
  - Dynamic content from database (no more static MDX files)
  - See [Projects Dashboard Documentation](docs/PROJECTS_DASHBOARD.md) for details
- **Users**: View and manage registered users
- **Settings**: Configure dashboard settings

### Logo and File Upload Options

For Experiences, Education, Certificates, and Projects, you can:
- Enter a URL directly for externally hosted files
- Upload an image file which will be stored in Supabase storage
- Upload PDF files for certificates (max 10MB)

### Certificate Page

View all certificates at `/certificate`:
- Beautiful card-based layout
- Group by company or view all
- Click to preview certificates in modal
- Support for both image and PDF certificates
- Direct links to verify certificates

### Analytics

This project includes Vercel Analytics integration for tracking page views and visitor statistics.

  
