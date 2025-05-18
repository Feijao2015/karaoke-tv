const fs = require('fs');
const path = require('path');

// Read environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

// Paths
const tvHtmlPath = path.join(__dirname, '../public/tv.html');

// Read and update the TV HTML file
try {
    let content = fs.readFileSync(tvHtmlPath, 'utf8');
    
    // Replace placeholders with actual values
    content = content.replace(/SUPABASE_URL/g, supabaseUrl);
    content = content.replace(/SUPABASE_ANON_KEY/g, supabaseKey);
    
    fs.writeFileSync(tvHtmlPath, content);
    console.log('✅ Updated TV HTML with Supabase credentials');
} catch (error) {
    console.error('❌ Error updating TV HTML:', error);
    process.exit(1);
} 