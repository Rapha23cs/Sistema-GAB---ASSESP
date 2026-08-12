import { GoogleSpreadsheet } from 'google-spreadsheet';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const CREDENTIALS_PATH = 'client_secret_302242102864-jddtdmn5hif9a3sr1d8hir5n3rmvn02l.apps.googleusercontent.com.json';
const TOKEN_PATH = 'token.json';
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

async function checkHeaders() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  
  // Use a default redirect uri if undefined
  const redirect_uri = (redirect_uris && redirect_uris.length > 0) ? redirect_uris[0] : 'urn:ietf:wg:oauth:2.0:oob';
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uri);

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(token);

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, oAuth2Client);
  await doc.loadInfo();
  
  const sheet = doc.sheetsByTitle['Esteira Raio-x (status)'];
  await sheet.loadHeaderRow(5);
  console.log(sheet.headerValues);
  
  // Also check Bodyscan
  const sheet2 = doc.sheetsByTitle['Bodyscan (status)'];
  await sheet2.loadHeaderRow(5);
  console.log("Bodyscan:", sheet2.headerValues);

  process.exit(0);
}
checkHeaders();
