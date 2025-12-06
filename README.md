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
   
   Or run these SQL commands in your Supabase SQL editor:
   ```sql
   insert into storage.buckets (id, name, public) 
   values ('experience-logos', 'experience-logos', true);
   
   insert into storage.buckets (id, name, public) 
   values ('education-logos', 'education-logos', true);
   ```

3. Configure RLS (Row Level Security) policies for the storage buckets if needed.

### Dashboard Features

Access the dashboard at `/dashboard` (requires authentication):

- **Overview**: Dashboard statistics and summary
- **Skills**: Manage your tech stack skills
- **Experiences**: Manage work experience entries with drag & drop ordering
- **Education**: Manage education entries with drag & drop ordering
- **Users**: View and manage registered users
- **Settings**: Configure dashboard settings

### Logo Upload Options

For both Experiences and Education, you can:
- Enter a URL directly for externally hosted logos
- Upload an image file which will be stored in Supabase storage

  
