require('dotenv').config(); // Carregar variáveis de ambiente do .env

const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');
const fs = require('fs');
const { Client: NotionClient } = require('@notionhq/client');
const { Client: MSGraphClient } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Google OAuth2
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

let auth = null;
let notionClient = null;
let msGraphClient = null;

// Configuração do Notion
function loadNotionClient() {
  try {
    const notionToken = process.env.NOTION_TOKEN || fs.readFileSync(path.join(__dirname, 'notion-token.txt'), 'utf8').trim();
    notionClient = new NotionClient({ auth: notionToken });
    console.log('✅ Notion API configurada com sucesso');
  } catch (error) {
    console.warn('⚠️  Notion Token não encontrado:', error.message);
  }
}

// Configuração do Microsoft Graph (To Do)
function loadMSGraphClient() {
  try {
    const msAccessToken = process.env.MS_ACCESS_TOKEN || fs.readFileSync(path.join(__dirname, 'ms-token.txt'), 'utf8').trim();
    msGraphClient = MSGraphClient.init({
      authProvider: (done) => {
        done(null, msAccessToken);
      }
    });
    console.log('✅ Microsoft Graph API configurada com sucesso');
  } catch (error) {
    console.warn('⚠️  Microsoft Token não encontrado:', error.message);
  }
}

// Carregar credenciais do Google
async function loadGoogleAuth() {
  try {
    let credentials, token;

    // Tentar ler das variáveis de ambiente primeiro (Railway)
    if (process.env.GOOGLE_CREDENTIALS && process.env.GOOGLE_TOKEN) {
      credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
      token = JSON.parse(process.env.GOOGLE_TOKEN);
      console.log('📦 Credenciais carregadas das variáveis de ambiente');
    }
    // Se não encontrar, ler dos arquivos locais
    else if (fs.existsSync(CREDENTIALS_PATH) && fs.existsSync(TOKEN_PATH)) {
      credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
      token = JSON.parse(fs.readFileSync(TOKEN_PATH));
      console.log('📁 Credenciais carregadas dos arquivos locais');
    }
    else {
      throw new Error('Credenciais não encontradas');
    }

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    oAuth2Client.setCredentials(token);
    auth = oAuth2Client;
    console.log('✅ Google API autenticada com sucesso');
  } catch (error) {
    console.warn('⚠️  Credenciais do Google não encontradas ou inválidas:', error.message);
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Inicializar banco de dados
const db = new Database('database.db');

// Criar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    completed INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'normal',
    due_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// ============= ROTAS DE TAREFAS =============
app.get('/api/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY completed, priority DESC, created_at DESC').all();
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, description, priority, due_date } = req.body;
  const result = db.prepare('INSERT INTO tasks (title, description, priority, due_date) VALUES (?, ?, ?, ?)').run(title, description, priority || 'normal', due_date);
  res.json({ id: result.lastInsertRowid, title });
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { completed, title, description, priority, due_date } = req.body;
  
  if (completed !== undefined) {
    db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(completed, id);
  } else {
    db.prepare('UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ? WHERE id = ?')
      .run(title, description, priority, due_date, id);
  }
  
  res.json({ success: true });
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.json({ success: true });
});

// ============= ROTAS DO GOOGLE CALENDAR =============
app.get('/api/calendar/events', async (req, res) => {
  if (!auth) {
    return res.status(500).json({ error: 'Google API não autenticada' });
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth });
    const { days = 7 } = req.query;

    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + parseInt(days));

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.json(response.data.items || []);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error.message);
    res.status(500).json({ error: 'Erro ao buscar eventos do Google Calendar' });
  }
});

// ============= ROTAS DO GOOGLE TASKS =============
app.get('/api/google-tasks', async (req, res) => {
  if (!auth) {
    return res.status(500).json({ error: 'Google API não autenticada' });
  }

  try {
    const tasks = google.tasks({ version: 'v1', auth });
    const response = await tasks.tasks.list({
      tasklist: '@default',
      maxResults: 100,
    });

    res.json(response.data.items || []);
  } catch (error) {
    console.error('Erro ao buscar tarefas do Google:', error.message);
    res.status(500).json({ error: 'Erro ao buscar tarefas do Google Tasks', details: error.message });
  }
});

app.put('/api/google-tasks/:taskId', async (req, res) => {
  if (!auth) {
    return res.status(500).json({ error: 'Google API não autenticada' });
  }

  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const tasks = google.tasks({ version: 'v1', auth });
    await tasks.tasks.update({
      tasklist: '@default',
      task: taskId,
      requestBody: { status },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar tarefa do Google:', error.message);
    res.status(500).json({ error: 'Erro ao atualizar tarefa do Google Tasks', details: error.message });
  }
});

// ============= ROTAS DO MICROSOFT TO DO =============
app.get('/api/ms-todo/lists', async (req, res) => {
  if (!msGraphClient) {
    return res.status(500).json({ error: 'Microsoft To Do não configurado' });
  }

  try {
    const lists = await msGraphClient.api('/me/todo/lists').get();
    res.json(lists.value || []);
  } catch (error) {
    console.error('Erro ao buscar listas do To Do:', error.message);
    res.status(500).json({ error: 'Erro ao buscar listas do Microsoft To Do', details: error.message });
  }
});

app.get('/api/ms-todo/tasks', async (req, res) => {
  if (!msGraphClient) {
    return res.status(500).json({ error: 'Microsoft To Do não configurado' });
  }

  try {
    const listId = process.env.MS_TODO_LIST_ID || req.query.listId;
    if (!listId) {
      return res.status(400).json({ error: 'List ID não especificado' });
    }

    const tasks = await msGraphClient.api(`/me/todo/lists/${listId}/tasks`).get();
    res.json(tasks.value || []);
  } catch (error) {
    console.error('Erro ao buscar tarefas do To Do:', error.message);
    res.status(500).json({ error: 'Erro ao buscar tarefas do Microsoft To Do', details: error.message });
  }
});

app.patch('/api/ms-todo/tasks/:taskId', async (req, res) => {
  if (!msGraphClient) {
    return res.status(500).json({ error: 'Microsoft To Do não configurado' });
  }

  try {
    const { taskId } = req.params;
    const listId = process.env.MS_TODO_LIST_ID || req.body.listId;
    if (!listId) {
      return res.status(400).json({ error: 'List ID não especificado' });
    }

    const updateData = {};
    if (req.body.status !== undefined) {
      updateData.status = req.body.status;
    }
    if (req.body.title !== undefined) {
      updateData.title = req.body.title;
    }

    await msGraphClient.api(`/me/todo/lists/${listId}/tasks/${taskId}`).patch(updateData);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar tarefa do To Do:', error.message);
    res.status(500).json({ error: 'Erro ao atualizar tarefa do Microsoft To Do', details: error.message });
  }
});

// ============= ROTAS DO NOTION (PLANO DE VIDA) =============
app.get('/api/notion/habits', async (req, res) => {
  if (!notionClient) {
    return res.status(500).json({ error: 'Notion não configurado' });
  }

  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const notionToken = process.env.NOTION_TOKEN;

    if (!databaseId) {
      return res.status(400).json({ error: 'NOTION_DATABASE_ID não configurado' });
    }
    if (!notionToken) {
      return res.status(400).json({ error: 'NOTION_TOKEN não configurado' });
    }

    // Usar fetch diretamente pois o SDK antigo não tem databases.query
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sorts: [{ property: 'Dia', direction: 'descending' }]
      })
    });

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // A estrutura do database: cada linha é um dia, cada coluna é um hábito
    // Pegar a linha mais recente (primeira após sort descendente)
    const habits = [];

    if (data.results && data.results.length > 0) {
      const latestDay = data.results[0];
      const properties = latestDay.properties;

      // Lista de hábitos diários (baseado nas colunas encontradas)
      const habitNames = [
        'Santa Missa', 'Sérviam', 'Preces', 'Exame', 'Lembrai-vos',
        'Terço', 'Leitura NT', 'Visita ao Santíssimo', '3 Ave Marias',
        'Oração da Manhã', 'Oração da Tarde', 'Contemplação', 'Angelus',
        'Leitura Espiritual', '2 horas'
      ];

      for (const habitName of habitNames) {
        if (properties[habitName]) {
          const prop = properties[habitName];
          let concluido = false;

          // Verificar tipo da propriedade (pode ser checkbox ou outro tipo)
          if (prop.type === 'checkbox') {
            concluido = prop.checkbox || false;
          } else if (prop.type === 'status') {
            concluido = prop.status?.name === 'Feito' || false;
          }

          habits.push({
            id: `${latestDay.id}-${habitName}`,
            nome: habitName,
            concluido: concluido,
            tipo: 'diaria',
            data: properties.Dia?.date?.start || null,
            pageId: latestDay.id
          });
        }
      }
    }

    res.json(habits);
  } catch (error) {
    console.error('Erro ao buscar hábitos do Notion:', error.message);
    res.status(500).json({ error: 'Erro ao buscar hábitos do Notion', details: error.message });
  }
});

app.patch('/api/notion/habits/:pageId', async (req, res) => {
  if (!notionClient) {
    return res.status(500).json({ error: 'Notion não configurado' });
  }

  try {
    const { pageId } = req.params;
    const { concluido, habitName } = req.body;
    const notionToken = process.env.NOTION_TOKEN;

    if (!notionToken) {
      return res.status(400).json({ error: 'NOTION_TOKEN não configurado' });
    }

    // Extrair o pageId real (remover o sufixo do habitName se existir)
    const realPageId = pageId.split('-')[0];

    // Usar fetch para atualizar a propriedade específica do hábito
    const response = await fetch(`https://api.notion.com/v1/pages/${realPageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          [habitName]: { checkbox: concluido }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Notion API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar hábito no Notion:', error.message);
    res.status(500).json({ error: 'Erro ao atualizar hábito no Notion', details: error.message });
  }
});

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializar todas as integrações e depois iniciar servidor
async function initializeServices() {
  await loadGoogleAuth();
  loadNotionClient();
  loadMSGraphClient();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor rodando em:`);
    console.log(`   - Local: http://localhost:${PORT}`);
    console.log(`   - Rede: http://172.26.197.166:${PORT}`);
    console.log(`\n📱 Para acessar no Kindle, use: http://172.26.197.166:${PORT}`);
  });
}

initializeServices();
