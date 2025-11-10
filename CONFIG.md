# Configuração do Kindle Hub

Este guia explica como configurar as integrações do Kindle Hub.

## 📋 Índice

1. [Google Calendar e Tasks](#google-calendar-e-tasks)
2. [Notion (Plano de Vida)](#notion-plano-de-vida)
3. [Google Tasks](#google-tasks)
4. [Contemplação (Imagens)](#contemplação-imagens)
5. [Deployment (Railway)](#deployment-railway)

---

## 🗓️ Google Calendar e Tasks

**Status atual:** Já configurado via `credentials.json` e `token.json`

Para reconfigurar ou adicionar em outro ambiente:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto e ative as APIs:
   - Google Calendar API
   - Google Tasks API
3. Crie credenciais OAuth 2.0
4. Baixe o JSON e salve como `credentials.json`
5. Execute a autenticação (o servidor gerará `token.json`)

---

## 📝 Notion (Plano de Vida)

### Passo 1: Criar Integração no Notion

1. Acesse: https://www.notion.so/my-integrations
2. Clique em **"+ New integration"**
3. Dê um nome: **"Kindle Hub"**
4. Selecione seu workspace
5. Copie o **Internal Integration Token**

### Passo 2: Criar Database no Notion

Crie uma database com as seguintes colunas:

| Nome da Coluna | Tipo     | Descrição                           |
|----------------|----------|-------------------------------------|
| Nome           | Title    | Nome do hábito (ex: "Serviam")      |
| Concluído      | Checkbox | Se foi feito hoje                   |
| Tipo           | Select   | "diaria" ou "semanal"               |
| Data           | Date     | Data da última atualização          |

Adicione os 14 hábitos diários e 4 semanais na database.

### Passo 3: Conectar Integração

1. Abra a database no Notion
2. Clique em **"..."** (menu)
3. Vá em **"Connections"** > **"Add connections"**
4. Selecione **"Kindle Hub"**

### Passo 4: Configurar no Projeto

Copie o token para o arquivo:
```bash
echo "secret_..." > notion-token.txt
```

Ou defina a variável de ambiente:
```bash
export NOTION_TOKEN="secret_..."
export NOTION_DATABASE_ID="<ID_DO_DATABASE>"
```

**Para encontrar o DATABASE_ID:**
- Abra a database no Notion
- Olhe a URL: `notion.so/WORKSPACE/DATABASE_ID?v=...`
- Copie os 32 caracteres do DATABASE_ID

---

## ✅ Google Tasks

**Ótima notícia:** Se o Google Calendar já está funcionando, o Google Tasks também está!

As mesmas credenciais (`credentials.json` e `token.json`) já incluem acesso ao Google Tasks API.

### Verificar se está funcionando

1. Acesse a página de Tarefas no seu Kindle Hub
2. As tarefas do Google Tasks aparecerão automaticamente
3. Você pode marcar/desmarcar tarefas diretamente

### Se não funcionar

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. No seu projeto, vá em **"APIs & Services"** > **"Library"**
3. Procure por **"Google Tasks API"**
4. Clique em **"Enable"**
5. Pronto! Não precisa gerar novas credenciais

---

## 🖼️ Contemplação (Imagens)

As imagens dos mistérios do Rosário ficam em:

```
public/cont/
  ├── gozosos/
  │   ├── 1.jpg
  │   ├── 2.jpg
  │   ├── 3.jpg
  │   ├── 4.jpg
  │   └── 5.jpg
  ├── dolorosos/
  │   └── (5 imagens)
  ├── gloriosos/
  │   └── (5 imagens)
  └── luminosos/
      └── (5 imagens)
```

**Para adicionar suas imagens:**

1. Prepare 20 imagens (5 para cada mistério)
2. Nomeie de `1.jpg` a `5.jpg` em cada pasta
3. Formatos aceitos: JPG, PNG
4. Recomendado: Imagens otimizadas para e-ink (preto e branco)

---

## 🚀 Deployment (Railway)

### Variáveis de Ambiente no Railway

Adicione no Railway apenas as variáveis necessárias:

```
NOTION_TOKEN=secret_...
NOTION_DATABASE_ID=19538d12893a810d909ee7319aab8122
GOOGLE_CREDENTIALS={"installed":{...}}
GOOGLE_TOKEN={"access_token":...}
```

**IMPORTANTE para Google:**
- `GOOGLE_CREDENTIALS` e `GOOGLE_TOKEN` devem ser o JSON completo em uma linha
- Ou faça upload dos arquivos `credentials.json` e `token.json`

### Deploy

```bash
git add .
git commit -m "Atualizar configurações"
git push
```

Railway detecta automaticamente e faz o deploy.

---

## ❓ Troubleshooting

### Notion não conecta
- Verifique se adicionou a integração à database
- Confira se o DATABASE_ID está correto (32 caracteres)
- Teste o token com: `curl -H "Authorization: Bearer $NOTION_TOKEN" https://api.notion.com/v1/users/me`

### Google Tasks não conecta
- Verifique se a API está ativada no Google Cloud Console
- As mesmas credenciais do Calendar já servem para Tasks
- Teste acessando a página de Tarefas no navegador

### Imagens não aparecem
- Verifique se os arquivos existem em `public/cont/<misterio>/`
- Nomes devem ser `1.jpg`, `2.jpg`, etc.
- Caminhos são case-sensitive

---

## 📞 Suporte

Para mais ajuda, consulte:
- [Notion API Docs](https://developers.notion.com/)
- [Microsoft Graph Docs](https://docs.microsoft.com/en-us/graph/)
- [Google Calendar API Docs](https://developers.google.com/calendar)
