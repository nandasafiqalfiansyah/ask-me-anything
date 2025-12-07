/**
 * Script to seed projects from MDX files into the Supabase database
 * 
 * Usage:
 * 1. Make sure you have a .env.local file with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * 2. Run: node scripts/seed-projects.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const projectsDir = path.join(__dirname, '../content/projects');

async function seedProjects() {
  console.log('🌱 Starting to seed projects...\n');

  // Read all MDX files from content/projects
  const files = fs.readdirSync(projectsDir).filter(file => file.endsWith('.mdx'));
  
  if (files.length === 0) {
    console.log('⚠️  No MDX files found in content/projects/');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(projectsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse frontmatter and content
    const { data: metadata, content } = matter(fileContent);
    
    // Generate slug from filename
    const slug = file.replace('.mdx', '');
    
    console.log(`📝 Processing: ${slug}`);
    
    // Prepare project data
    const projectData = {
      slug,
      metadata: {
        title: metadata.title,
        summary: metadata.summary,
        image: metadata.image,
        author: metadata.author || 'ndav',
        tags: metadata.tags || [],
        publishedAt: metadata.publishedAt
      },
      content: content.trim()
    };

    try {
      // Call the API to create the project
      const response = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          slug: projectData.slug,
          title: projectData.metadata.title,
          summary: projectData.metadata.summary || null,
          image_url: projectData.metadata.image || null,
          author: projectData.metadata.author,
          tags: projectData.metadata.tags,
          published_at: projectData.metadata.publishedAt,
          content: projectData.content,
          sort_order: i
        })
      });

      if (response.ok || response.status === 201) {
        console.log(`   ✅ Successfully inserted: ${slug}`);
        successCount++;
      } else if (response.status === 409) {
        console.log(`   ⚠️  Already exists: ${slug}`);
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Failed to insert: ${slug}`);
        console.log(`   Error: ${response.status} - ${errorText}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`   ❌ Error inserting ${slug}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✨ Seeding complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Already existed: ${files.length - successCount - errorCount}`);
  console.log('='.repeat(50) + '\n');
}

seedProjects().catch(console.error);
