import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDENTIALS_PATH = path.join(__dirname, 'client_secret_302242102864-jddtdmn5hif9a3sr1d8hir5n3rmvn02l.apps.googleusercontent.com.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

async function createUsersSheet() {
  console.log('Autenticando...');
  
  let credentials;
  if (fs.existsSync(CREDENTIALS_PATH)) {
    credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  } else if (process.env.GOOGLE_CREDENTIALS) {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } else {
    throw new Error('Arquivo de credenciais não encontrado.');
  }

  let token;
  if (fs.existsSync(TOKEN_PATH)) {
    token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  } else if (process.env.GOOGLE_TOKEN) {
    token = JSON.parse(process.env.GOOGLE_TOKEN);
  } else {
    throw new Error('Arquivo de token não encontrado.');
  }

  const { client_secret, client_id } = credentials.web || credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret);
  oAuth2Client.setCredentials(token);

  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, oAuth2Client);
  await doc.loadInfo();
  
  console.log(`Planilha "${doc.title}" carregada.`);

  // Verifica se a aba Usuários já existe
  const existingSheet = doc.sheetsByTitle['Usuários'];
  if (existingSheet) {
    console.log('A aba "Usuários" já existe.');
    return;
  }

  // Cria a aba
  console.log('Criando a aba "Usuários"...');
  const newSheet = await doc.addSheet({
    title: 'Usuários',
    headerValues: ['ID', 'Nome', 'Email', 'Senha', 'Status', 'Role', 'DataCadastro']
  });

  console.log('Aba "Usuários" criada com sucesso!');
}

createUsersSheet().catch(console.error);
