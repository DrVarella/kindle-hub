require('dotenv').config();
const { Client } = require('@notionhq/client');

async function test() {
  try {
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    // Teste 1: Verificar estrutura do objeto
    console.log('=== Estrutura do client ===');
    console.log('notion.databases é:', typeof notion.databases);
    console.log('Propriedades de databases:', Object.keys(notion.databases));
    
    // Teste 2: Tentar query direto
    console.log('\n=== Testando query ===');
    const response = await notion.databases.query({
      database_id: databaseId
    });
    
    console.log('✅ Query funcionou!', response.results.length, 'resultados');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    // Teste 3: Tentar retrieve
    try {
      console.log('\n=== Testando retrieve ===');
      const db = await notion.databases.retrieve({ database_id: databaseId });
      console.log('✅ Database encontrado:', db.title?.[0]?.plain_text);
    } catch (e2) {
      console.error('❌ Retrieve também falhou:', e2.message);
    }
  }
}

test();
