from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import os.path
import pickle

SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/tasks'
]

def get_credentials():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    
    return creds

# Usar as credenciais
creds = get_credentials()
calendar_service = build('calendar', 'v3', credentials=creds)
tasks_service = build('tasks', 'v1', credentials=creds)

print('✅ Credenciais obtidas com sucesso!')
print(f'Scopes autorizados: {creds.scopes}')

# Testar Calendar
events = calendar_service.events().list(calendarId='primary', maxResults=3).execute()
print(f'\n📅 Calendar: {len(events.get("items", []))} eventos encontrados')

# Testar Tasks
tasks = tasks_service.tasks().list(tasklist='@default', maxResults=3).execute()
print(f'✅ Tasks: {len(tasks.get("items", []))} tarefas encontradas')
