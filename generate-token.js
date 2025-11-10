const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/tasks'
];

const CREDENTIALS_PATH = 'credentials.json';
const TOKEN_PATH = 'token.json';

async function authorize() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Arquivo credentials.json não encontrado!');
    console.error('Baixe as credenciais do Google Cloud Console primeiro.');
    return;
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n🔐 Autorize esta aplicação visitando esta URL:\n');
  console.log(authUrl);
  console.log('\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Digite o código de autorização aqui: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('❌ Erro ao obter token de acesso:', err);
        return;
      }

      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
      console.log('\n✅ Token salvo em', TOKEN_PATH);
      console.log('\n📋 Para o Railway, copie este JSON para a variável GOOGLE_TOKEN:\n');
      console.log(JSON.stringify(token));
      console.log('\n');
    });
  });
}

authorize();
