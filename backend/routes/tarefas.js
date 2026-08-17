import express from 'express';
import { getDoc } from '../googleSheets.js';

const router = express.Router();

router.get('/', async (req, res) => {
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

router.post('/', async (req, res) => {
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

router.put('/:rowNumber', async (req, res) => {
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

router.delete('/:rowNumber', async (req, res) => {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Tarefas'];
    const rows = await sheet.getRows();
    const row = rows.find(r => r.rowNumber === parseInt(req.params.rowNumber));
    if (!row) return res.status(404).json({ error: 'Tarefa não encontrada' });

    await row.delete();
    res.json({ message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
