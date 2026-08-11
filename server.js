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
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
            informacoes_pendencias: row.get('INFORMAÇÕES / PENDÊNCIAS'),
            status: row.get('STATUS'),
            ordem_servico: row.get('ORDEM DE SERVIÇO (atual)')
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
      'STATUS': data.status || '',
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
      'STATUS': data.status || '',
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

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} conectado ao Google Sheets!`);
});
