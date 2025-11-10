require('dotenv').config();
const { Client } = require('@notionhq/client');

async function test() {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  
  // Tentar com fetch direto
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Query funcionou via fetch!');
      console.log('Resultados:', data.results.length);
      if (data.results[0]) {
        console.log('Colunas:', Object.keys(data.results[0].properties));
      }
    } else {
      console.log('❌ Erro:', data.message);
      console.log('Code:', data.code);
    }
  } catch (error) {
    console.error('❌ Erro no fetch:', error.message);
  }
}

test();
