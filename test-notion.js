const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });

console.log('Notion Client criado com sucesso!');
console.log('Métodos disponíveis:', Object.keys(notion));
console.log('Tem databases?', typeof notion.databases);
