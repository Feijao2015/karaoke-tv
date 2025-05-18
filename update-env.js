const fs = require('fs');
const path = require('path');

// Lê as variáveis de ambiente do arquivo .env
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Faltam variáveis de ambiente do Supabase');
    process.exit(1);
}

// Atualiza o arquivo HTML
try {
    let content = fs.readFileSync('index.html', 'utf8');
    
    content = content.replace(/SUPABASE_URL/g, supabaseUrl);
    content = content.replace(/SUPABASE_ANON_KEY/g, supabaseKey);
    
    fs.writeFileSync('index.html', content);
    console.log('✅ Credenciais do Supabase atualizadas com sucesso');
} catch (error) {
    console.error('❌ Erro ao atualizar as credenciais:', error);
    process.exit(1);
} 