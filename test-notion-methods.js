const { Client } = require('@notionhq/client');
const notion = new Client({ auth: 'test' });

console.log('databases methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(notion.databases)));
