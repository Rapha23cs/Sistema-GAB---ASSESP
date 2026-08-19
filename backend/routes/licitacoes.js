import express from 'express';
import { getDoc } from '../googleSheets.js';
import { getSheetMutex } from '../utils/mutex.js';
import { withCache, invalidateCache } from '../utils/cache.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const licitacoes = await withCache('licitacoes', async () => {
      const doc = await getDoc();
      const sheet = doc.sheetsByTitle['Procs. Licitatórios (sem Contrato)'];
      if (!sheet) throw new Error('Aba "Procs. Licitatórios (sem Contrato)" não encontrada.');

      await sheet.loadHeaderRow(5);
      const rows = await sheet.getRows();

      return rows
        .filter(row => row.get('PROCESSO ORIGINAL (SEI)'))
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
          tipo_objeto: row.get('TIPO DE OBJETO')
        })).reverse();
    });

    res.json(licitacoes);
  } catch (error) {
    console.error('Erro GET Licitacoes:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const data = req.body;
  try {
    const mutex = getSheetMutex('Procs. Licitatórios (sem Contrato)');
    const release = await mutex.acquire();
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
      'TIPO DE OBJETO': data.tipo_objeto || ''
    });

      const licitacao = { ...data, id: newRow.rowNumber };
      invalidateCache('licitacoes');
      res.status(201).json(licitacao);
    } finally {
      release();
    }
  } catch (error) {
    console.error('Erro POST Licitacoes:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {

    const mutex = getSheetMutex('Procs. Licitatórios (sem Contrato)');
    const release = await mutex.acquire();
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
      rowToUpdate.set('TIPO DE OBJETO', data.tipo_objeto || '');

      await rowToUpdate.save();
      invalidateCache('licitacoes');

      res.json({ ...data, id: rowToUpdate.rowNumber });
    } finally {
      release();
    }
  } catch (error) {
    console.error('Erro PUT Licitacoes:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const mutex = getSheetMutex('Procs. Licitatórios (sem Contrato)');
    const release = await mutex.acquire();
    try {
      const doc = await getDoc();
      const sheet = doc.sheetsByTitle['Procs. Licitatórios (sem Contrato)'];
      if (!sheet) return res.status(404).json({ error: 'Aba não encontrada.' });

      await sheet.loadHeaderRow(5);
      const rows = await sheet.getRows();
      const rowToDelete = rows.find(r => r.rowNumber === parseInt(id));

      if (!rowToDelete) return res.status(404).json({ error: 'Registro não encontrado' });

      await rowToDelete.delete();
      res.json({ message: 'Licitação deletada' });
      invalidateCache('licitacoes');
    } finally {
      release();
    }
  } catch (error) {
    console.error('Erro DELETE Licitacoes:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
