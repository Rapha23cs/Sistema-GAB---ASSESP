import { GoogleSpreadsheet } from 'google-spreadsheet';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const CREDENTIALS_PATH = 'client_secret_302242102864-jddtdmn5hif9a3sr1d8hir5n3rmvn02l.apps.googleusercontent.com.json';
const TOKEN_PATH = 'token.json';
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

async function main() {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));

    const { client_secret, client_id } = credentials.web || credentials.installed;
    const oAuth2Client = new OAuth2Client(client_id, client_secret);
    oAuth2Client.setCredentials(token);

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, oAuth2Client);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Usuários'];
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    
    rows.forEach(r => {
      console.log(`Email: "${r.get('Email')}", Senha: "${r.get('Senha')}", Status: ${r.get('Status')}`);
    });

  } catch (error) {
    console.error('Erro:', error);
  }
}

main();
