import { GoogleSpreadsheet } from 'google-spreadsheet';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const credentials = JSON.parse(fs.readFileSync('client_secret_302242102864-jddtdmn5hif9a3sr1d8hir5n3rmvn02l.apps.googleusercontent.com.json', 'utf-8'));
    const token = JSON.parse(fs.readFileSync('token.json', 'utf-8'));
    
    const {client_secret, client_id} = credentials.web || credentials.installed;
    const oAuth2Client = new OAuth2Client(client_id, client_secret);
    oAuth2Client.setCredentials(token);

    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, oAuth2Client);
    await doc.loadInfo(); 
    
    const sheet = doc.sheetsByTitle['Contratos - PPMA'];
    await sheet.loadHeaderRow(5);
    
    console.log("CABEÇALHOS ENCONTRADOS NA LINHA 5:");
    console.log(sheet.headerValues);
  } catch(e) {
    console.error(e);
  }
}
run();
