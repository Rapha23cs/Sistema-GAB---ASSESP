import express from 'express';
import cors from 'cors';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-padrao-segura-123';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Cache simples em memória para evitar limite do Google Sheets (Erro 429)
const apiCache = new Map();

function cacheMiddleware(req, res, next) {
  // Se for uma requisição que altera dados (POST, PUT, DELETE), limpa todo o cache
  if (req.method !== 'GET') {
    apiCache.clear();
    return next();
  }

  const key = req.originalUrl;
  const cached = apiCache.get(key);
  // Usa o cache se tiver menos de 5 segundos (suficiente para agrupar requisições concorrentes da tela)
  if (cached && (Date.now() - cached.timestamp < 5000)) {
    return res.json(cached.data);
  }
  
  const originalJson = res.json;
  res.json = function(body) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      apiCache.set(key, { timestamp: Date.now(), data: body });
    }
    return originalJson.call(res, body);
  };
  next();
}

app.use('/api', cacheMiddleware);

// Middleware de Autenticação JWT
function authenticateToken(req, res, next) {
  // Ignora verificação para as rotas públicas de auth
  if (req.originalUrl === '/api/auth/login' || req.originalUrl === '/api/auth/register') return next();

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
    req.user = user;
    next();
  });
}

// Aplica o middleware globalmente para todas as rotas (exceto /api/auth que é tratada dentro da função)
app.use('/api', authenticateToken);

// Google Sheets Config
const CREDENTIALS_PATH = path.join(__dirname, 'client_secret_302242102864-jddtdmn5hif9a3sr1d8hir5n3rmvn02l.apps.googleusercontent.com.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

let cachedDoc = null;
let lastDocLoad = 0;

async function getDoc() {
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
        responsavel: row.get('RESPONSÁVEL'),
        status: row.get('STATUS')
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
      'RESPONSÁVEL': data.responsavel || '',
      'STATUS': data.status || ''
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
      'PRAZO DE ENTREGA (previsão)': data.prazo_entrega || ''
    });
    rowToUpdate.set('STATUS do Proc. Licitatório', data.status_licitacao || '');
    rowToUpdate.set('LOCALIZAÇÃO', data.localizacao || '');
    rowToUpdate.set('CONSULTA', data.consulta || '');
    rowToUpdate.set('RESPONSÁVEL', data.responsavel || '');
    rowToUpdate.set('STATUS', data.status || '');

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
// Rotas de Equipamentos
const EQUIP_SHEETS = [
  { title: 'Esteira Raio-x (status)', headerRow: 5, category: 'Esteira Raio-x' },
  { title: 'Bodyscan (status)', headerRow: 5, category: 'Bodyscan' },
  { title: 'Pórticos (status)', headerRow: 4, category: 'Pórticos' }
];

const OS_SHEETS = [
  { category: 'Bodyscan', title: 'Ordens de Serviço - Bodyscan', headerRow: 5 },
  { category: 'Esteira Raio-x', title: 'Ordens de Serviço - Esteiras', headerRow: 5 }
];

// Função auxiliar para atualizar o status do equipamento via automação da OS
async function updateEquipmentStatus(doc, categoria, numeroSerie, newStatus) {
  if (!numeroSerie) return;
  const conf = EQUIP_SHEETS.find(c => c.category === categoria);
  if (!conf) return;
  
  const sheet = doc.sheetsByTitle[conf.title];
  if (!sheet) return;
  
  await sheet.loadHeaderRow(conf.headerRow);
  const rows = await sheet.getRows();
  const equipRow = rows.find(r => r.get('N° DE SÉRIE') === numeroSerie);
  
  if (equipRow) {
    equipRow.set('STATUS', newStatus);
    await equipRow.save();
    console.log(`[Automação] Equipamento ${numeroSerie} atualizado para ${newStatus}`);
  }
}

app.get('/api/equipamentos', async (req, res) => {
  try {
    const doc = await getDoc();
    let todosEquipamentos = [];

    for (const conf of EQUIP_SHEETS) {
      const sheet = doc.sheetsByTitle[conf.title];
      if (sheet) {
        await sheet.loadHeaderRow(conf.headerRow);
        const rows = await sheet.getRows();
        const equipamentos = rows
          .filter(row => row.get('EQUIPAMENTO') || row.get('N° DE SÉRIE'))
          .map(row => ({
            id: row.rowNumber,
            categoria: conf.category,
            sheetTitle: conf.title,
            cobertura_contrato: row.get('COBERTURA DE CONTRATO'),
            localidade: row.get('LOCALIDADE'),
            equipamento: row.get('EQUIPAMENTO'),
            unidade: row.get('UNIDADE'),
            modelo: row.get('MODELO'),
            numero_serie: row.get('N° DE SÉRIE'),
            informacoes_pendencias: row.get('INFORMAÇÕES / PENDÊNCIAS') || row.get('PENDÊNCIA'),
            status: row.get('STATUS'),
            ordem_servico: row.get('ORDEM DE SERVIÇO / TAREFA') || row.get('ORDEM DE SERVIÇO (atual)')
          }));
        todosEquipamentos = [...todosEquipamentos, ...equipamentos];
      }
    }
    // Não vamos usar o reverse no array inteiro senão mistura as abas. Mas tudo bem, o react pode ordenar.
    res.json(todosEquipamentos.reverse());
  } catch (error) {
    console.error('Erro GET Equipamentos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/equipamentos', async (req, res) => {
  const data = req.body;
  try {
    const conf = EQUIP_SHEETS.find(c => c.category === data.categoria);
    if (!conf) return res.status(400).json({ error: 'Categoria inválida' });

    const doc = await getDoc();
    const sheet = doc.sheetsByTitle[conf.title];
    if (!sheet) return res.status(404).json({ error: `Aba ${conf.title} não encontrada` });

    await sheet.loadHeaderRow(conf.headerRow);
    const newRow = await sheet.addRow({
      'COBERTURA DE CONTRATO': data.cobertura_contrato || '',
      'LOCALIDADE': data.localidade || '',
      'EQUIPAMENTO': data.equipamento || '',
      'UNIDADE': data.unidade || '',
      'MODELO': data.modelo || '',
      'N° DE SÉRIE': data.numero_serie || '',
      'INFORMAÇÕES / PENDÊNCIAS': data.informacoes_pendencias || '',
      'PENDÊNCIA': data.informacoes_pendencias || '',
      'STATUS': data.status || '',
      'ORDEM DE SERVIÇO / TAREFA': data.ordem_servico || '',
      'ORDEM DE SERVIÇO (atual)': data.ordem_servico || ''
    });

    res.status(201).json({ ...data, id: newRow.rowNumber, sheetTitle: conf.title });
  } catch (error) {
    console.error('Erro POST Equipamentos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/equipamentos/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const conf = EQUIP_SHEETS.find(c => c.category === data.categoria);
    if (!conf) return res.status(400).json({ error: 'Categoria inválida' });

    const doc = await getDoc();
    const sheet = doc.sheetsByTitle[conf.title];
    if (!sheet) return res.status(404).json({ error: `Aba ${conf.title} não encontrada` });

    await sheet.loadHeaderRow(conf.headerRow);
    const rows = await sheet.getRows();
    const rowToUpdate = rows.find(r => r.rowNumber === parseInt(id));

    if (!rowToUpdate) return res.status(404).json({ error: 'Equipamento não encontrado' });

    rowToUpdate.assign({
      'COBERTURA DE CONTRATO': data.cobertura_contrato || '',
      'LOCALIDADE': data.localidade || '',
      'EQUIPAMENTO': data.equipamento || '',
      'UNIDADE': data.unidade || '',
      'MODELO': data.modelo || '',
      'N° DE SÉRIE': data.numero_serie || '',
      'INFORMAÇÕES / PENDÊNCIAS': data.informacoes_pendencias || '',
      'PENDÊNCIA': data.informacoes_pendencias || '',
      'STATUS': data.status || '',
      'ORDEM DE SERVIÇO / TAREFA': data.ordem_servico || '',
      'ORDEM DE SERVIÇO (atual)': data.ordem_servico || ''
    });

    await rowToUpdate.save();
    res.json({ ...data, id: rowToUpdate.rowNumber, sheetTitle: conf.title });
  } catch (error) {
    console.error('Erro PUT Equipamentos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/equipamentos/:id', async (req, res) => {
  const { id } = req.params;
  const categoria = req.query.categoria;

  try {
    const conf = EQUIP_SHEETS.find(c => c.category === categoria);
    if (!conf) return res.status(400).json({ error: 'Categoria inválida para deleção' });

    const doc = await getDoc();
    const sheet = doc.sheetsByTitle[conf.title];
    if (!sheet) return res.status(404).json({ error: `Aba ${conf.title} não encontrada` });

    await sheet.loadHeaderRow(conf.headerRow);
    const rows = await sheet.getRows();
    const rowToDelete = rows.find(r => r.rowNumber === parseInt(id));

    if (!rowToDelete) return res.status(404).json({ error: 'Equipamento não encontrado' });

    await rowToDelete.delete();
    res.json({ message: 'Equipamento deletado' });
  } catch (error) {
    console.error('Erro DELETE Equipamentos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/oss', async (req, res) => {
  try {
    const doc = await getDoc();
    let todasOSs = [];

    for (const conf of OS_SHEETS) {
      const sheet = doc.sheetsByTitle[conf.title];
      if (sheet) {
        await sheet.loadHeaderRow(conf.headerRow);
        const rows = await sheet.getRows();
        
        const oss = rows
          .filter(row => row.get('ORDEM DE SERVIÇO') || row.get('PROCESSO'))
          .map(row => ({
            id: row.rowNumber,
            categoria: conf.category,
            sheetTitle: conf.title,
            contrato: row.get('CONTRATO'),
            processo: row.get('PROCESSO'),
            ordem_servico: row.get('ORDEM DE SERVIÇO'),
            equipamento: row.get('EQUIPAMENTO'),
            sei: row.get('SEI'),
            tipo_servico: row.get('TIPO DE SERVIÇO'),
            modelo: row.get('MODELO'),
            numero_serie: row.get('N° DE SÉRIE'),
            unidade: row.get('UNIDADE'),
            data_assinatura: row.get('DATA DE ASSINATURA - DG/PPMA'),
            data_tarefa: row.get('DATA DA TAREFA'),
            data_tratativa: row.get('DATA DA TRATATIVA'),
            tarefa: row.get('TAREFA'),
            tratativa: row.get('TRATATIVA'),
            observacoes_tarefa: row.get('OBSERVAÇÕES DA TAREFA'),
            observacoes_tratativa: row.get('OBSERVARÇÕES DA TRATATIVA'),
            status: row.get('STATUS'),
            cronograma: row.get('CRONOGRAMA')
          }));
        todasOSs = [...todasOSs, ...oss];
      }
    }
    res.json(todasOSs.reverse());
  } catch (error) {
    console.error('Erro GET OSs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/oss', async (req, res) => {
  const data = req.body;
  const items = Array.isArray(data) ? data : [data];
  
  if (items.length === 0) return res.status(400).json({ error: 'Nenhum dado enviado' });

  try {
    const conf = OS_SHEETS.find(c => c.category === items[0].categoria);
    if (!conf) return res.status(400).json({ error: 'Categoria de OS inválida' });

    const doc = await getDoc();
    const sheet = doc.sheetsByTitle[conf.title];
    if (!sheet) return res.status(404).json({ error: `Aba ${conf.title} não encontrada` });

    await sheet.loadHeaderRow(conf.headerRow);
    
    const rowsToAdd = items.map(item => {
      let contratoForcado = item.contrato;
      let processoForcado = item.processo;
      if (conf.category === 'Bodyscan') {
        contratoForcado = 'N° 002/2024 - VMI';
        processoForcado = '167633/2023';
      }
      if (conf.category === 'Esteira Raio-x') {
        contratoForcado = 'N° 056/2026 - TECHSCAN';
        processoForcado = '02406/2025';
      }

      return {
        'CONTRATO': contratoForcado || '',
        'PROCESSO': processoForcado || '',
        'ORDEM DE SERVIÇO': item.ordem_servico || '',
        'EQUIPAMENTO': item.equipamento || '',
        'SEI': item.sei || '',
        'TIPO DE SERVIÇO': item.tipo_servico || '',
        'MODELO': item.modelo || '',
        'N° DE SÉRIE': item.numero_serie || '',
        'UNIDADE': item.unidade || '',
        'DATA DE ASSINATURA - DG/PPMA': item.data_assinatura || '',
        'DATA DA TAREFA': item.data_tarefa || '',
        'DATA DA TRATATIVA': item.data_tratativa || '',
        'TAREFA': item.tarefa || '',
        'TRATATIVA': item.tratativa || '',
        'OBSERVAÇÕES DA TAREFA': item.observacoes_tarefa || '',
        'OBSERVARÇÕES DA TRATATIVA': item.observacoes_tratativa || '',
        'STATUS': item.status || ''
      };
    });

    const newRows = await sheet.addRows(rowsToAdd);

    // Automação: Atualizar status do equipamento baseado na OS
    try {
      for (const item of items) {
        // Garante que só funcione se for Corretiva
        if (item.tipo_servico && item.tipo_servico.toLowerCase() === 'corretiva') {
          if (item.status === 'CONCLUIDO') {
            await updateEquipmentStatus(doc, item.categoria, item.numero_serie, 'FUNCIONANDO');
          } else if (item.status === 'PENDENTE') {
            await updateEquipmentStatus(doc, item.categoria, item.numero_serie, 'FUNCIONANDO COM PENDÊNCIA');
          }
        }
      }
    } catch (e) {
      console.error('Erro na automação OS -> Equipamento:', e);
    }

    res.status(201).json({ message: "OS criadas com sucesso", count: newRows.length });
  } catch (error) {
    console.error('Erro POST OSs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/oss/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const conf = OS_SHEETS.find(c => c.category === data.categoria);
    if (!conf) return res.status(400).json({ error: 'Categoria inválida' });

    const doc = await getDoc();
    const sheet = doc.sheetsByTitle[conf.title];
    if (!sheet) return res.status(404).json({ error: `Aba ${conf.title} não encontrada` });

    await sheet.loadHeaderRow(conf.headerRow);
    const rows = await sheet.getRows();
    const rowToUpdate = rows.find(r => r.rowNumber === parseInt(id));

    if (!rowToUpdate) return res.status(404).json({ error: 'OS não encontrada' });

    let contratoForcado = data.contrato;
    let processoForcado = data.processo;
    if (conf.category === 'Bodyscan') {
      contratoForcado = 'N° 002/2024 - VMI';
      processoForcado = '167633/2023';
    }
    if (conf.category === 'Esteira Raio-x') {
      contratoForcado = 'N° 056/2026 - TECHSCAN';
      processoForcado = '02406/2025';
    }

    const rowData = {};
    if (contratoForcado !== undefined) rowData['CONTRATO'] = contratoForcado;
    if (processoForcado !== undefined) rowData['PROCESSO'] = processoForcado;
    if (data.ordem_servico !== undefined) rowData['ORDEM DE SERVIÇO'] = data.ordem_servico;
    if (data.equipamento !== undefined) rowData['EQUIPAMENTO'] = data.equipamento;
    if (data.sei !== undefined) rowData['SEI'] = data.sei;
    if (data.tipo_servico !== undefined) rowData['TIPO DE SERVIÇO'] = data.tipo_servico;
    if (data.modelo !== undefined) rowData['MODELO'] = data.modelo;
    if (data.numero_serie !== undefined) rowData['N° DE SÉRIE'] = data.numero_serie;
    if (data.unidade !== undefined) rowData['UNIDADE'] = data.unidade;
    if (data.data_assinatura !== undefined) rowData['DATA DE ASSINATURA - DG/PPMA'] = data.data_assinatura;
    if (data.data_tarefa !== undefined) rowData['DATA DA TAREFA'] = data.data_tarefa;
    if (data.data_tratativa !== undefined) rowData['DATA DA TRATATIVA'] = data.data_tratativa;
    if (data.tarefa !== undefined) rowData['TAREFA'] = data.tarefa;
    if (data.tratativa !== undefined) rowData['TRATATIVA'] = data.tratativa;
    if (data.observacoes_tarefa !== undefined) rowData['OBSERVAÇÕES DA TAREFA'] = data.observacoes_tarefa;
    if (data.observacoes_tratativa !== undefined) rowData['OBSERVARÇÕES DA TRATATIVA'] = data.observacoes_tratativa;
    if (data.status !== undefined) rowData['STATUS'] = data.status;

    rowToUpdate.assign(rowData);
    await rowToUpdate.save();

    // Automação: Atualizar status do equipamento baseado na OS
    try {
      // Garante que só funcione se for Corretiva
      if (data.tipo_servico && data.tipo_servico.toLowerCase() === 'corretiva') {
        if (data.status === 'CONCLUIDO') {
          await updateEquipmentStatus(doc, data.categoria, data.numero_serie, 'FUNCIONANDO');
        } else if (data.status === 'PENDENTE') {
          await updateEquipmentStatus(doc, data.categoria, data.numero_serie, 'FUNCIONANDO COM PENDÊNCIA');
        }
      }
    } catch (e) {
      console.error('Erro na automação OS -> Equipamento:', e);
    }

    res.json({ ...data, id: rowToUpdate.rowNumber, sheetTitle: conf.title });
  } catch (error) {
    console.error('Erro PUT OSs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/oss/:id', async (req, res) => {
  const { id } = req.params;
  const categoria = req.query.categoria;

  try {
    const conf = OS_SHEETS.find(c => c.category === categoria);
    if (!conf) return res.status(400).json({ error: 'Categoria inválida para deleção' });

    const doc = await getDoc();
    const sheet = doc.sheetsByTitle[conf.title];
    if (!sheet) return res.status(404).json({ error: `Aba ${conf.title} não encontrada` });

    await sheet.loadHeaderRow(conf.headerRow);
    const rows = await sheet.getRows();
    const rowToDelete = rows.find(r => r.rowNumber === parseInt(id));

    if (!rowToDelete) return res.status(404).json({ error: 'OS não encontrada' });

    await rowToDelete.delete();
    res.json({ message: 'OS deletada' });
  } catch (error) {
    console.error('Erro DELETE OSs:', error);
    res.status(500).json({ error: error.message });
  }
});
// ==========================================
// ROTAS DE TAREFAS (COLABORAÇÃO)
// ==========================================

app.get('/api/tarefas', async (req, res) => {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Tarefas'];
    if (!sheet) return res.status(404).json({ error: 'Aba Tarefas não encontrada' });
    const rows = await sheet.getRows();
    const tarefas = rows.map(r => ({
      id: r.get('ID'),
      rowNumber: r.rowNumber,
      text: r.get('Descrição'),
      author: r.get('Autor'),
      assignee: r.get('Atribuído'),
      date: r.get('DataCadastro'),
      status: r.get('Status'),
      completed: r.get('Status') === 'Concluída',
      priority: r.get('Prioridade')
    }));
    res.json(tarefas.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tarefas', async (req, res) => {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Tarefas'];
    const novaTarefa = req.body;
    await sheet.addRow({
      'ID': novaTarefa.id,
      'Descrição': novaTarefa.text,
      'Autor': novaTarefa.author,
      'Atribuído': novaTarefa.assignee,
      'DataCadastro': novaTarefa.date,
      'Status': 'Pendente',
      'Prioridade': novaTarefa.priority
    });
    res.json({ message: 'Tarefa adicionada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tarefas/:rowNumber', async (req, res) => {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Tarefas'];
    const rows = await sheet.getRows();
    const row = rows.find(r => r.rowNumber === parseInt(req.params.rowNumber));
    if (!row) return res.status(404).json({ error: 'Tarefa não encontrada' });
    
    row.set('Status', req.body.completed ? 'Concluída' : 'Pendente');
    await row.save();
    res.json({ message: 'Status atualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================

// Registrar novo usuário
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'Preencha todos os campos.' });

    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Usuários'];
    if (!sheet) return res.status(500).json({ error: 'Aba de usuários não encontrada.' });

    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    // Verifica se email já existe
    if (rows.some(r => r.get('Email') === email)) {
      return res.status(400).json({ error: 'Este email já está em uso.' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    // Salva o usuário como pendente
    await sheet.addRow({
      'ID': Date.now().toString(),
      'Nome': nome,
      'Email': email,
      'Senha': hashedPassword,
      'Status': 'Pendente',
      'Role': 'Usuario',
      'DataCadastro': new Date().toISOString()
    });

    res.json({ message: 'Cadastro realizado com sucesso. Aguardando aprovação do administrador.' });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'Preencha todos os campos.' });

    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Usuários'];
    if (!sheet) return res.status(500).json({ error: 'Aba de usuários não encontrada.' });

    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    const userRow = rows.find(r => r.get('Email') === email);
    if (!userRow) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const isValidPassword = await bcrypt.compare(senha, userRow.get('Senha'));
    if (!isValidPassword) return res.status(401).json({ error: 'Credenciais inválidas.' });

    if (userRow.get('Status') !== 'Aprovado') {
      return res.status(403).json({ error: 'Sua conta ainda não foi aprovada pelo administrador.' });
    }

    // Gerar JWT
    const token = jwt.sign(
      { id: userRow.get('ID'), email: userRow.get('Email'), role: userRow.get('Role'), nome: userRow.get('Nome') },
      JWT_SECRET,
      { expiresIn: '7d' } // Expira em 7 dias
    );

    res.json({ token, user: { nome: userRow.get('Nome'), email: userRow.get('Email'), role: userRow.get('Role') } });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Obter usuários (Todos os usuários logados podem ver)
app.get('/api/auth/users', async (req, res) => {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Usuários'];
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    const users = rows.map(r => ({
      id: r.get('ID'),
      nome: r.get('Nome'),
      email: r.get('Email'),
      status: r.get('Status'),
      role: r.get('Role'),
      dataCadastro: r.get('DataCadastro')
    }));

    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Aprovar usuário (Apenas admin)
app.put('/api/auth/users/:id/approve', async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Acesso negado.' });

    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Usuários'];
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    const userRow = rows.find(r => r.get('ID') === req.params.id);
    if (!userRow) return res.status(404).json({ error: 'Usuário não encontrado.' });

    userRow.set('Status', 'Aprovado');
    await userRow.save();

    res.json({ message: 'Usuário aprovado com sucesso.' });
  } catch (error) {
    console.error('Erro ao aprovar usuário:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Deletar usuário (Apenas admin)
app.delete('/api/auth/users/:id', async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Acesso negado.' });

    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Usuários'];
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    const userRow = rows.find(r => r.get('ID') === req.params.id);
    if (!userRow) return res.status(404).json({ error: 'Usuário não encontrado.' });

    await userRow.delete();

    res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// -------------------------------------------------------------
// Rotas de Licitações
// -------------------------------------------------------------
app.get('/api/licitacoes', async (req, res) => {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Procs. Licitatórios (sem Contrato)'];
    if (!sheet) return res.status(404).json({ error: 'Aba "Procs. Licitatórios (sem Contrato)" não encontrada.' });

    await sheet.loadHeaderRow(5);
    const rows = await sheet.getRows();

    const licitacoes = rows
      .filter(row => row.get('PROCESSO ORIGINAL (SEI)')) // ignora linhas vazias
      .map(row => ({
        id: row.rowNumber,
        processo_original: row.get('PROCESSO ORIGINAL (SEI)'),
        processo_autorizacao: row.get('PROCESSOS DE AUTORIZAÇÃO (GOVERNO)'),
        stargov: row.get('STARGOV N°'),
        memo: row.get('MEMO DE ABERTURA'),
        modalidade: row.get('LICITAÇÃO (modalidade)'),
        custeio: row.get('CUSTEIO/RECURSO'),
        valor_previsto: row.get('VALOR CONTRATUAL PREVISTO'),
        objeto: row.get('OBJETO'),
        quantidade: row.get('QUANTIDADE'),
        status: row.get('STATUS'),
        localizacao: row.get('LOCALIZAÇÃO'),
        data: row.get('DATA'),
        consultor: row.get('CONSULTOR')
      }));

    res.json(licitacoes.reverse());
  } catch (error) {
    console.error('Erro GET Licitacoes:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/licitacoes', async (req, res) => {
  const data = req.body;
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Procs. Licitatórios (sem Contrato)'];
    if (!sheet) return res.status(404).json({ error: 'Aba não encontrada.' });

    await sheet.loadHeaderRow(5);

    const newRow = await sheet.addRow({
      'PROCESSO ORIGINAL (SEI)': data.processo_original || '',
      'PROCESSOS DE AUTORIZAÇÃO (GOVERNO)': data.processo_autorizacao || '',
      'STARGOV N°': data.stargov || '',
      'MEMO DE ABERTURA': data.memo || '',
      'LICITAÇÃO (modalidade)': data.modalidade || '',
      'CUSTEIO/RECURSO': data.custeio || '',
      'VALOR CONTRATUAL PREVISTO': data.valor_previsto || '',
      'OBJETO': data.objeto || '',
      'QUANTIDADE': data.quantidade || '',
      'STATUS': data.status || '',
      'LOCALIZAÇÃO': data.localizacao || '',
      'DATA': data.data || '',
      'CONSULTOR': data.consultor || ''
    });

    const licitacao = { ...data, id: newRow.rowNumber };
    res.status(201).json(licitacao);
  } catch (error) {
    console.error('Erro POST Licitacoes:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/licitacoes/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Procs. Licitatórios (sem Contrato)'];
    if (!sheet) return res.status(404).json({ error: 'Aba não encontrada.' });

    await sheet.loadHeaderRow(5);
    const rows = await sheet.getRows();
    const rowToUpdate = rows.find(r => r.rowNumber === parseInt(id));

    if (!rowToUpdate) return res.status(404).json({ error: 'Registro não encontrado' });

    rowToUpdate.set('PROCESSO ORIGINAL (SEI)', data.processo_original || '');
    rowToUpdate.set('PROCESSOS DE AUTORIZAÇÃO (GOVERNO)', data.processo_autorizacao || '');
    rowToUpdate.set('STARGOV N°', data.stargov || '');
    rowToUpdate.set('MEMO DE ABERTURA', data.memo || '');
    rowToUpdate.set('LICITAÇÃO (modalidade)', data.modalidade || '');
    rowToUpdate.set('CUSTEIO/RECURSO', data.custeio || '');
    rowToUpdate.set('VALOR CONTRATUAL PREVISTO', data.valor_previsto || '');
    rowToUpdate.set('OBJETO', data.objeto || '');
    rowToUpdate.set('QUANTIDADE', data.quantidade || '');
    rowToUpdate.set('STATUS', data.status || '');
    rowToUpdate.set('LOCALIZAÇÃO', data.localizacao || '');
    rowToUpdate.set('DATA', data.data || '');
    rowToUpdate.set('CONSULTOR', data.consultor || '');

    await rowToUpdate.save();
    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    console.error('Erro PUT Licitacoes:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/licitacoes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Procs. Licitatórios (sem Contrato)'];
    if (!sheet) return res.status(404).json({ error: 'Aba não encontrada.' });

    await sheet.loadHeaderRow(5);
    const rows = await sheet.getRows();
    const rowToDelete = rows.find(r => r.rowNumber === parseInt(id));

    if (!rowToDelete) return res.status(404).json({ error: 'Registro não encontrado' });

    await rowToDelete.delete();
    res.json({ message: 'Apagado com sucesso' });
  } catch (error) {
    console.error('Erro DELETE Licitacoes:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} conectado ao Google Sheets!`);
});
