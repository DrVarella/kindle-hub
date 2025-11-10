const fs = require('fs');
const { google } = require('googleapis');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/tasks'
];

const CREDENTIALS_PATH = 'credentials.json';
const TOKEN_PATH = 'token.json';

async function generateToken(authCode) {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Arquivo credentials.json não encontrado!');
    return;
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  try {
    const { tokens } = await oAuth2Client.getToken(authCode);

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log('\n✅ Token salvo em', TOKEN_PATH);
    console.log('\n📋 Para o Railway, copie este JSON para a variável GOOGLE_TOKEN:\n');
    console.log(JSON.stringify(tokens));
    console.log('\n');

    return tokens;
  } catch (err) {
    console.error('❌ Erro ao obter token de acesso:', err.message);
    throw err;
  }
}

const authCode = process.argv[2];
if (!authCode) {
  console.error('❌ Por favor, forneça o código de autorização como parâmetro');
  console.error('Uso: node generate-token-auto.js "SEU_CODIGO_AQUI"');
  process.exit(1);
}

generateToken(authCode).catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
