import express from 'express';
import { getDoc } from '../googleSheets.js';
import { getSheetMutex } from '../utils/mutex.js';
import { withCache, invalidateCache } from '../utils/cache.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await withCache('contratos', async () => {
      const doc = await getDoc();
      const sheet = doc.sheetsByTitle['Contratos - PPMA'];
      if (!sheet) throw new Error('Aba "Contratos - PPMA" não encontrada na planilha.');

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
          portaria: row.get('PORTARIA'),
          status: row.get('STATUS')
        }));

      // Inverte a ordem para os mais recentes (últimas linhas da planilha) aparecerem primeiro
      return contratos.reverse();
    });
    res.json(data);
  } catch (error) {
    console.error('Erro GET Contratos:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const data = req.body;

  try {
    const mutex = getSheetMutex('Contratos - PPMA');
    const release = await mutex.acquire();
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
      'PORTARIA': data.portaria || '',
      'STATUS': data.status || ''
    });

    const contrato = { ...data, id: newRow.rowNumber };
    res.status(201).json(contrato);
    invalidateCache('contratos');
    } finally {
      release();
    }
  } catch (error) {
    console.error('Erro POST Contratos:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params; // número da linha
  const data = req.body;

  try {
    const mutex = getSheetMutex('Contratos - PPMA');
    const release = await mutex.acquire();
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
    rowToUpdate.set('PORTARIA', data.portaria || '');
    rowToUpdate.set('STATUS', data.status || '');

    await rowToUpdate.save();

    res.json({ ...data, id: rowToUpdate.rowNumber });
    invalidateCache('contratos');
    } finally {
      release();
    }
  } catch (error) {
    console.error('Erro PUT Contratos:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Contratos - PPMA'];
    if (!sheet) return res.status(404).json({ error: 'Aba "Contratos - PPMA" não encontrada na planilha.' });

    await sheet.loadHeaderRow(5);
    const mutex = getSheetMutex('Contratos - PPMA');
    const release = await mutex.acquire();
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
      invalidateCache('contratos');
    } finally {
      release();
    }
  } catch (error) {
    console.error('Erro DELETE Contratos:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
