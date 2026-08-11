import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDENTIALS_PATH = path.join(__dirname, 'client_secret_302242102864-jddtdmn5hif9a3sr1d8hir5n3rmvn02l.apps.googleusercontent.com.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

async function createAdmin() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('Uso correto: node create_admin.js <Email> <Senha> <Nome>');
    console.log('Exemplo: node create_admin.js raphael@email.com 123456 "Raphael"');
    process.exit(1);
  }

  const [email, senha, ...nomeParts] = args;
  const nome = nomeParts.join(' ');

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
  
  const sheet = doc.sheetsByTitle['Usuários'];
  if (!sheet) {
    throw new Error('A aba "Usuários" não existe. Por favor, crie-a primeiro.');
  }

  await sheet.loadHeaderRow();

  // Verifica se o email já existe
  const rows = await sheet.getRows();
  if (rows.some(r => r.get('Email') === email)) {
    console.log(`Erro: O email ${email} já está cadastrado.`);
    process.exit(1);
  }

  // Gera hash da senha
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(senha, salt);

  // Adiciona o usuário
  await sheet.addRow({
    'ID': Date.now().toString(),
    'Nome': nome,
    'Email': email,
    'Senha': hashedPassword,
    'Status': 'Aprovado',
    'Role': 'Admin',
    'DataCadastro': new Date().toISOString()
  });

  console.log('\n=======================================');
  console.log(` ✅ Administrador criado com sucesso!`);
  console.log(` Nome: ${nome}`);
  console.log(` Email: ${email}`);
  console.log(` Role: Admin`);
  console.log(` Status: Aprovado`);
  console.log('=======================================\n');
}

createAdmin().catch(console.error);
