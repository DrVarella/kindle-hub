require('dotenv').config();
const { Client } = require('@notionhq/client');

async function test() {
  try {
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    console.log('Token:', process.env.NOTION_TOKEN.substring(0, 20) + '...');
    console.log('Database ID:', databaseId);
    
    const response = await notion.databases.query({
      database_id: databaseId,
    });
    
    console.log('\n✅ Sucesso! Encontrados', response.results.length, 'itens');
    
    if (response.results.length > 0) {
      const first = response.results[0];
      console.log('\nPrimeiro item:');
      console.log('- ID:', first.id);
      console.log('- Properties:', Object.keys(first.properties));
    }
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.status);
  }
}

test();
