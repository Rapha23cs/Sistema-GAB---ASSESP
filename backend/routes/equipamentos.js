import express from 'express';
import { getDoc } from '../googleSheets.js';
import { EQUIP_SHEETS } from '../utils/sheetsConfig.js';

const router = express.Router();

router.get('/', async (req, res) => {
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
            contrato: row.get('CONTRATO'),
            data_garantia: row.get('DATA DA GARANTIA') || row.get('DATA DE GARANTIA'),
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

router.post('/', async (req, res) => {
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

router.put('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
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

export default router;
