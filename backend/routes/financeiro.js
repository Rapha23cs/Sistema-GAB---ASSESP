import express from 'express';
import { getDoc } from '../googleSheets.js';
import { getSheetMutex } from '../utils/mutex.js';

const router = express.Router();

const getSheetByContrato = async (contrato) => {
  const doc = await getDoc();
  let sheet;
  if (contrato === 'CT 02/2024') {
    sheet = doc.sheetsByTitle['Financeiro CT 02/2024'];
    if (sheet) await sheet.loadHeaderRow(5);
  } else if (contrato === 'CT 88/2025 (MANUT)') {
    sheet = doc.sheetsByTitle['Financeiro CT 88/2025 (MANUT)'];
    if (sheet) await sheet.loadHeaderRow(1);
  } else if (contrato === 'CT 88/2025 (PEÇAS)') {
    sheet = doc.sheetsByTitle['Financeiro CT 88/2025 (PEÇAS)'];
    if (sheet) await sheet.loadHeaderRow(1);
  }
  return sheet;
};

router.get('/', async (req, res) => {
  try {
    const doc = await getDoc();
    const s1 = doc.sheetsByTitle['Financeiro CT 02/2024'];
    const s2 = doc.sheetsByTitle['Financeiro CT 88/2025 (MANUT)'];
    const s3 = doc.sheetsByTitle['Financeiro CT 88/2025 (PEÇAS)'];
    let financeiro = [];

    const mapRow = (row, sheetId, contrato) => ({
      id: `${sheetId}_${row.rowNumber}`,
      contrato,
      objeto: row.get('OBJETO'), sei: row.get('SEI'), mes: row.get('MÊS'),
      nota_fiscal: row.get('NOTA FISCAL'), valor_nf: row.get('VALOR NF'),
      status_nf: row.get('STATUS NF (RFC/RGC)'), fonte_custeio: row.get('FONTE DE CUSTEIO'),
      ordem_bancaria: row.get('ORDEM BANCÁRIA'), valor_ob: row.get('VALOR OB'),
      data_pagamento: row.get('DATA DO PAGAMENTO'), status_ob: row.get('STATUS OB')
    });

    if (s1) {
      await s1.loadHeaderRow(5);
      const r1 = await s1.getRows();
      financeiro = financeiro.concat(r1.filter(row => row.get('OBJETO')).map(row => mapRow(row, 's1', 'CT 02/2024')));
    }
    if (s2) {
      await s2.loadHeaderRow(1);
      const r2 = await s2.getRows();
      financeiro = financeiro.concat(r2.filter(row => row.get('OBJETO')).map(row => mapRow(row, 's2', 'CT 88/2025 (MANUT)')));
    }
    if (s3) {
      await s3.loadHeaderRow(1);
      const r3 = await s3.getRows();
      financeiro = financeiro.concat(r3.filter(row => row.get('OBJETO')).map(row => mapRow(row, 's3', 'CT 88/2025 (PEÇAS)')));
    }

    res.json(financeiro.reverse());
  } catch (error) {
    console.error('Erro GET Financeiro:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const data = req.body;
  try {
    const sheet = await getSheetByContrato(data.contrato);
    if (!sheet) return res.status(404).json({ error: 'Aba não encontrada para este contrato.' });

    const mutex = getSheetMutex(sheet.title);
    const release = await mutex.acquire();
    try {

    const newRow = await sheet.addRow({
      'OBJETO': data.objeto, 'SEI': data.sei, 'MÊS': data.mes,
      'NOTA FISCAL': data.nota_fiscal, 'VALOR NF': data.valor_nf,
      'STATUS NF (RFC/RGC)': data.status_nf, 'FONTE DE CUSTEIO': data.fonte_custeio,
      'ORDEM BANCÁRIA': data.ordem_bancaria, 'VALOR OB': data.valor_ob,
      'DATA DO PAGAMENTO': data.data_pagamento, 'STATUS OB': data.status_ob
    });
      const sheetId = data.contrato === 'CT 02/2024' ? 's1' : (data.contrato === 'CT 88/2025 (MANUT)' ? 's2' : 's3');
      res.status(201).json({ id: `${sheetId}_${newRow.rowNumber}`, ...data });
    } finally {
      release();
    }
  } catch (error) {
    console.error('Erro POST Financeiro:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const rowNumber = parseInt(id.split('_')[1], 10);

  try {
    const sheet = await getSheetByContrato(data.contrato);
    if (!sheet) return res.status(404).json({ error: 'Aba não encontrada para este contrato.' });

    const mutex = getSheetMutex(sheet.title);
    const release = await mutex.acquire();
    try {

    const rows = await sheet.getRows();
    const row = rows.find(r => r.rowNumber === rowNumber);
    if (!row) return res.status(404).json({ error: 'Registro não encontrado' });

    row.set('OBJETO', data.objeto);
    row.set('SEI', data.sei);
    row.set('MÊS', data.mes);
    row.set('NOTA FISCAL', data.nota_fiscal);
    row.set('VALOR NF', data.valor_nf);
    row.set('STATUS NF (RFC/RGC)', data.status_nf);
    row.set('FONTE DE CUSTEIO', data.fonte_custeio);
    row.set('ORDEM BANCÁRIA', data.ordem_bancaria);
    row.set('VALOR OB', data.valor_ob);
    row.set('DATA DO PAGAMENTO', data.data_pagamento);
    row.set('STATUS OB', data.status_ob);

    await row.save();
    res.json({ id, ...data });
    } finally {
      release();
    }
  } catch (error) {
    console.error('Erro PUT Financeiro:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { contrato } = req.query;
  const rowNumber = parseInt(id.split('_')[1], 10);

  try {
    const sheet = await getSheetByContrato(contrato);
    if (!sheet) return res.status(404).json({ error: 'Aba não encontrada para este contrato.' });

    const mutex = getSheetMutex(sheet.title);
    const release = await mutex.acquire();
    try {

    const rows = await sheet.getRows();
    const row = rows.find(r => r.rowNumber === rowNumber);
    if (!row) return res.status(404).json({ error: 'Registro não encontrado' });

    await row.delete();
    res.json({ success: true });
    } finally {
      release();
    }
  } catch (error) {
    console.error('Erro DELETE Financeiro:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
