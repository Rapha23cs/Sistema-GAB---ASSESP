import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs';

// Configurações
const CREDENTIALS_PATH = 'client_secret_302242102864-jddtdmn5hif9a3sr1d8hir5n3rmvn02l.apps.googleusercontent.com.json';
const SPREADSHEET_ID = '11bN9t0B_wDjiKHEp32Ggmq-uX3StKDj6YjYFRWNcT08';

async function main() {
  try {
    console.log('1. Lendo credenciais locais (token.json)...');

    // Ler token em cache
    let tokenData;
    try {
      const tokenContent = fs.readFileSync('token.json', 'utf8');
      tokenData = JSON.parse(tokenContent);
    } catch (e) {
      console.error('Erro: Você precisa rodar o login e gerar o token.json primeiro.');
      process.exit(1);
    }

    // Ler client secret
    const credsContent = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
    const creds = JSON.parse(credsContent);
    const { client_secret, client_id } = creds.web || creds.installed;

    const { OAuth2Client } = await import('google-auth-library');
    const oAuth2Client = new OAuth2Client(client_id, client_secret);
    oAuth2Client.setCredentials(tokenData);

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, oAuth2Client);

    console.log('2. Conectando na planilha...');
    await doc.loadInfo();
    console.log(`Conectado à Planilha: ${doc.title}`);

    // Verifica se a aba já existe
    const title = 'Tarefas';
    const existingSheet = doc.sheetsByTitle[title];
    if (existingSheet) {
      console.log(`A aba "${title}" já existe! Nenhuma alteração foi feita.`);
      return;
    }

    console.log(`3. Criando aba "${title}"...`);
    const newSheet = await doc.addSheet({ title });

    console.log('4. Configurando colunas...');
    await newSheet.setHeaderRow([
      'ID',
      'Descrição',
      'Autor',
      'Atribuído',
      'DataCadastro',
      'Status',
      'Prioridade'
    ]);

    console.log('✅ Aba de Tarefas criada com sucesso e pronta para uso!');

  } catch (error) {
    console.error('❌ Erro na execução:', error);
  }
}

main();
