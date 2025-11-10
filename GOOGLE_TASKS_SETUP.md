# Corrigir Erro de Autenticação do Google Tasks

## Problema
O erro "Request had insufficient authentication scopes" indica que o token do Google não tem permissão para acessar o Google Tasks.

## Solução

Para corrigir, você precisa gerar um novo token com os scopes corretos:

### 1. Deletar o token atual

No ambiente Railway, remova a variável de ambiente `GOOGLE_TOKEN` e adicione novamente após gerar um novo token.

Localmente:
```bash
rm token.json
```

### 2. Garantir que os scopes estão corretos

O código deve solicitar estes scopes ao gerar o token:
- `https://www.googleapis.com/auth/calendar.readonly` (Calendar)
- `https://www.googleapis.com/auth/tasks` (Tasks - leitura e escrita)

### 3. Gerar novo token

Você precisa criar um script de autenticação. Crie o arquivo `generate-token.js`:

```javascript
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
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);

      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('Token stored to', TOKEN_PATH);
      console.log('\nPara o Railway, copie este JSON para a variável GOOGLE_TOKEN:');
      console.log(JSON.stringify(token));
    });
  });
}

authorize();
```

### 4. Executar o script

```bash
node generate-token.js
```

### 5. Seguir as instruções

1. Abra a URL que aparecer no terminal
2. Faça login com sua conta Google
3. Aceite as permissões
4. Copie o código de autorização
5. Cole no terminal

### 6. Atualizar no Railway

Após gerar o novo token:

1. Copie o conteúdo do `token.json`
2. No Railway, vá em Variables
3. Atualize a variável `GOOGLE_TOKEN` com o novo JSON
4. Redeploy da aplicação

## Verificação

Após fazer isso, o Google Tasks deve funcionar corretamente tanto no localhost quanto no Railway.
