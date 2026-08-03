import express from 'express';
import cors from 'cors';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Google Sheets Config
const CREDENTIALS_PATH = path.join(__dirname, 'client_secret_302242102864-jddtdmn5hif9a3sr1d8hir5n3rmvn02l.apps.googleusercontent.com.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

async function getDoc() {
  if (!process.env.SPREADSHEET_ID || process.env.SPREADSHEET_ID === 'O_SEU_ID_DA_PLANILHA_AQUI') {
    throw new Error('SPREADSHEET_ID não configurado corretamente no .env');
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  
  const {client_secret, client_id} = credentials.web || credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret);
  oAuth2Client.setCredentials(token);

  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, oAuth2Client);
  await doc.loadInfo(); 
  return doc;
}

// Rotas de Contratos
app.get('/api/contratos', async (req, res) => {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Contratos - PPMA'];
    if (!sheet) return res.status(404).json({ error: 'Aba "Contratos - PPMA" não encontrada na planilha.' });
    
    await sheet.loadHeaderRow(5);

    const rows = await sheet.getRows();
    const contratos = rows
      .filter(row => row.get('CONTRATO') || row.get('OBJETO') || row.get('RESPONSÁVEL')) // Ignora linhas vazias
      .map((row) => ({
      id: row.rowNumber, // Usamos o número da linha como ID único para editar/deletar
      numero_contrato: row.get('CONTRATO'),
      vigencia: row.get('VIGÊNCIA'),
      processo: row.get('PROCESSO "mãe" (SEI ou físico)'),
      tipo: row.get('TIPO (OS/OF)'),
      recurso_financeiro: row.get('RECURSO FINANCEIRO'),
      valor_global: row.get('VALOR GLOBAL (atualizado)'),
      valor_mensal: row.get('VALOR MENSAL'),
      objeto: row.get('OBJETO'),
      quantidade: row.get('QUANTIDADE'),
      execucao: row.get('EXECUÇÃO'),
      pendencia: row.get('PENDÊNCIA (saldo)'),
      prazo_entrega: row.get('PRAZO DE ENTREGA (previsão)'),
      status_licitacao: row.get('STATUS do Proc. Licitatório'),
      localizacao: row.get('LOCALIZAÇÃO'),
      consulta: row.get('CONSULTA'),
      responsavel: row.get('RESPONSÁVEL')
    }));
    
    // Inverte a ordem para os mais recentes (últimas linhas da planilha) aparecerem primeiro
    res.json(contratos.reverse());
  } catch (error) {
    console.error('Erro GET Contratos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contratos', async (req, res) => {
  const data = req.body;
  
  try {
    const doc = await getDoc();
    let sheet = doc.sheetsByTitle['Contratos - PPMA'];
    if (!sheet) return res.status(404).json({ error: 'Aba "Contratos - PPMA" não encontrada na planilha.' });

    await sheet.loadHeaderRow(5);

    const newRow = await sheet.addRow({
      'CONTRATO': data.numero_contrato || '',
      'VIGÊNCIA': data.vigencia || '',
      'PROCESSO "mãe" (SEI ou físico)': data.processo || '',
      'TIPO (OS/OF)': data.tipo || '',
      'RECURSO FINANCEIRO': data.recurso_financeiro || '',
      'VALOR GLOBAL (atualizado)': data.valor_global || '',
      'VALOR MENSAL': data.valor_mensal || '',
      'OBJETO': data.objeto || '',
      'QUANTIDADE': data.quantidade || '',
      'EXECUÇÃO': data.execucao || '',
      'PENDÊNCIA (saldo)': data.pendencia || '',
      'PRAZO DE ENTREGA (previsão)': data.prazo_entrega || '',
      'STATUS do Proc. Licitatório': data.status_licitacao || '',
      'LOCALIZAÇÃO': data.localizacao || '',
      'CONSULTA': data.consulta || '',
      'RESPONSÁVEL': data.responsavel || ''
    });

    const contrato = { ...data, id: newRow.rowNumber };
    res.status(201).json(contrato);
  } catch (error) {
    console.error('Erro POST Contratos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/contratos/:id', async (req, res) => {
  const { id } = req.params; // número da linha
  const data = req.body;
  
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Contratos - PPMA'];
    if (!sheet) return res.status(404).json({ error: 'Aba "Contratos - PPMA" não encontrada na planilha.' });

    await sheet.loadHeaderRow(5);
    const rows = await sheet.getRows();
    const rowToUpdate = rows.find(r => r.rowNumber === parseInt(id));
    
    if (!rowToUpdate) return res.status(404).json({ error: 'Contrato não encontrado na planilha' });

    rowToUpdate.assign({
      'CONTRATO': data.numero_contrato || '',
      'VIGÊNCIA': data.vigencia || '',
      'PROCESSO "mãe" (SEI ou físico)': data.processo || '',
      'TIPO (OS/OF)': data.tipo || '',
      'RECURSO FINANCEIRO': data.recurso_financeiro || '',
      'VALOR GLOBAL (atualizado)': data.valor_global || '',
      'VALOR MENSAL': data.valor_mensal || '',
      'OBJETO': data.objeto || '',
      'QUANTIDADE': data.quantidade || '',
      'EXECUÇÃO': data.execucao || '',
      'PENDÊNCIA (saldo)': data.pendencia || '',
      'PRAZO DE ENTREGA (previsão)': data.prazo_entrega || '',
      'STATUS do Proc. Licitatório': data.status_licitacao || '',
      'LOCALIZAÇÃO': data.localizacao || '',
      'CONSULTA': data.consulta || '',
      'RESPONSÁVEL': data.responsavel || ''
    });

    await rowToUpdate.save();

    res.json({ ...data, id: rowToUpdate.rowNumber });
  } catch (error) {
    console.error('Erro PUT Contratos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/contratos/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Contratos - PPMA'];
    if (!sheet) return res.status(404).json({ error: 'Aba "Contratos - PPMA" não encontrada na planilha.' });

    await sheet.loadHeaderRow(5);
    const rows = await sheet.getRows();
    const rowToDelete = rows.find(r => r.rowNumber === parseInt(id));
    
    if (!rowToDelete) return res.status(404).json({ error: 'Contrato não encontrado na planilha' });

    await rowToDelete.delete();
    res.json({ message: 'Contrato deletado com sucesso do Google Sheets' });
  } catch (error) {
    console.error('Erro DELETE Contratos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} conectado ao Google Sheets!`);
});
