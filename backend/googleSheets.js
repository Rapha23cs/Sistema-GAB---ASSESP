import { GoogleSpreadsheet } from 'google-spreadsheet';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajusta o caminho pois este arquivo agora está em ./backend/
const CREDENTIALS_PATH = path.join(__dirname, '../client_secret_302242102864-jddtdmn5hif9a3sr1d8hir5n3rmvn02l.apps.googleusercontent.com.json');
const TOKEN_PATH = path.join(__dirname, '../token.json');

let cachedDoc = null;
let lastDocLoad = 0;

export async function getDoc() {
  if (cachedDoc && (Date.now() - lastDocLoad < 60000)) {
    return cachedDoc; // Retorna o doc em cache se tem menos de 1 minuto
  }

  if (!process.env.SPREADSHEET_ID || process.env.SPREADSHEET_ID === 'O_SEU_ID_DA_PLANILHA_AQUI') {
    throw new Error('SPREADSHEET_ID não configurado corretamente no .env');
  }

  let credentials;
  if (fs.existsSync(CREDENTIALS_PATH)) {
    credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  } else if (process.env.GOOGLE_CREDENTIALS) {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } else {
    throw new Error('Arquivo de credenciais não encontrado e variável GOOGLE_CREDENTIALS não definida.');
  }

  let token;
  if (fs.existsSync(TOKEN_PATH)) {
    token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  } else if (process.env.GOOGLE_TOKEN) {
    token = JSON.parse(process.env.GOOGLE_TOKEN);
  } else {
    throw new Error('Arquivo de token não encontrado e variável GOOGLE_TOKEN não definida.');
  }

  const { client_secret, client_id } = credentials.web || credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret);
  oAuth2Client.setCredentials(token);

  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, oAuth2Client);
  await doc.loadInfo();

  cachedDoc = doc;
  lastDocLoad = Date.now();

  return doc;
}
