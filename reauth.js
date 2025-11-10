const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// Scopes necessários: Calendar E Tasks
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/tasks'
];

const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

async function authorize() {
  // Carregar credenciais
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Gerar URL de autenticação
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n🔐 Autorize o acesso abrindo esta URL no seu navegador:\n');
  console.log(authUrl);
  console.log('\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('Cole o código da URL de retorno aqui: ', async (code) => {
      rl.close();
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // Salvar token
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
        console.log('\n✅ Token salvo em token.json');
        console.log(`📋 Scopes autorizados: ${tokens.scope}`);

        resolve(oAuth2Client);
      } catch (error) {
        console.error('❌ Erro ao obter token:', error.message);
        reject(error);
      }
    });
  });
}

// Testar APIs após autorização
async function testApis(auth) {
  console.log('\n🧪 Testando APIs...\n');

  // Testar Calendar
  try {
    const calendar = google.calendar({ version: 'v3', auth });
    const events = await calendar.events.list({
      calendarId: 'primary',
      maxResults: 3,
      singleEvents: true,
      orderBy: 'startTime',
    });
    console.log(`✅ Google Calendar: ${events.data.items.length} eventos encontrados`);
  } catch (error) {
    console.error('❌ Erro no Calendar:', error.message);
  }

  // Testar Tasks
  try {
    const tasks = google.tasks({ version: 'v1', auth });
    const taskList = await tasks.tasks.list({
      tasklist: '@default',
      maxResults: 10,
    });
    console.log(`✅ Google Tasks: ${taskList.data.items?.length || 0} tarefas encontradas`);
  } catch (error) {
    console.error('❌ Erro no Tasks:', error.message);
  }
}

// Executar
(async () => {
  try {
    const auth = await authorize();
    await testApis(auth);
    console.log('\n🎉 Reautorização completa! Pode reiniciar o servidor agora.\n');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
})();
