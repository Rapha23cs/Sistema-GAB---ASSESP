import fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import url from 'url';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'client_secret_302242102864-jddtdmn5hif9a3sr1d8hir5n3rmvn02l.apps.googleusercontent.com.json';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

fs.readFile(CREDENTIALS_PATH, (err, content) => {
  if (err) return console.log('Erro ao carregar o arquivo client_secret:', err);
  authorize(JSON.parse(content), generateNewToken);
});

function authorize(credentials, callback) {
  const { client_secret, client_id } = credentials.web || credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, REDIRECT_URI);
  callback(oAuth2Client);
}

function generateNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  console.log('\n=============================================================');
  console.log(' ATENÇÃO: ANTES DE ACESSAR O LINK, CONFIGURE O G-CLOUD!');
  console.log('=============================================================');
  console.log(`1. Vá no Google Cloud Console, onde você criou esta credencial.`);
  console.log(`2. Edite a credencial e adicione esta URL exata em "URIs de redirecionamento autorizados":`);
  console.log(`   ${REDIRECT_URI}`);
  console.log(`3. Salve as alterações lá no Google.`);
  console.log('\nDepois de salvar, abra este link no seu navegador:');
  console.log('\n' + authUrl + '\n');
  console.log('=============================================================\n');
  console.log('Aguardando você fazer o login no navegador... (Servidor rodando na porta 3000)');

  // Inicia um servidor temporário para receber o código de volta
  const server = http.createServer(async (req, res) => {
    try {
      if (req.url.indexOf('/oauth2callback') > -1) {
        const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
        const code = qs.get('code');

        res.end('Autenticacao concluida! Pode fechar esta janela e voltar ao terminal.');
        server.close();

        oAuth2Client.getToken(code, (err, token) => {
          if (err) return console.error('❌ Erro ao recuperar o token de acesso.', err);

          fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error(err);
            console.log('\n✅ SUCESSO! Token armazenado em', TOKEN_PATH);
            console.log('Feche a janela do navegador e me avise no chat que deu certo!');
            process.exit(0);
          });
        });
      }
    } catch (e) {
      console.error(e);
    }
  }).listen(3000);
}
