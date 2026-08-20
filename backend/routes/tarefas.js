import express from 'express';
import { getDoc } from '../googleSheets.js';
import { getSheetMutex } from '../utils/mutex.js';
import { withCache, invalidateCache } from '../utils/cache.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await withCache('tarefas', async () => {
      const doc = await getDoc();
      const sheet = doc.sheetsByTitle['Tarefas'];
      if (!sheet) throw new Error('Aba Tarefas não encontrada');
      const rows = await sheet.getRows();
      const tarefas = rows.map(r => {
        let comentarios = [];
        try {
          comentarios = r.get('Comentários') ? JSON.parse(r.get('Comentários')) : [];
        } catch (e) {
          comentarios = [];
        }
        return {
          id: r.get('ID'),
          rowNumber: r.rowNumber,
          text: r.get('Descrição'),
          author: r.get('Autor'),
          assignee: r.get('Atribuído'),
          date: r.get('DataCadastro'),
          status: r.get('Status'),
          completed: r.get('Status') === 'Concluída',
          priority: r.get('Prioridade'),
          comentarios: comentarios
        };
      });
      return tarefas.reverse();
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const mutex = getSheetMutex('Tarefas');
    const release = await mutex.acquire();
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
        'Prioridade': novaTarefa.priority,
        'Comentários': '[]'
      });
      res.json({ message: 'Tarefa adicionada' });
      invalidateCache('tarefas');
    } finally {
      release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:rowNumber', async (req, res) => {
  try {
    const mutex = getSheetMutex('Tarefas');
    const release = await mutex.acquire();
    try {
      const doc = await getDoc();
      const sheet = doc.sheetsByTitle['Tarefas'];
      const rows = await sheet.getRows();
      const row = rows.find(r => r.rowNumber === parseInt(req.params.rowNumber));
      if (!row) return res.status(404).json({ error: 'Tarefa não encontrada' });

      row.set('Status', req.body.completed ? 'Concluída' : 'Pendente');
      await row.save();
      res.json({ message: 'Tarefa atualizada' });
      invalidateCache('tarefas');
    } finally {
      release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:rowNumber', async (req, res) => {
  try {
    const mutex = getSheetMutex('Tarefas');
    const release = await mutex.acquire();
    try {
      const doc = await getDoc();
      const sheet = doc.sheetsByTitle['Tarefas'];
      const rows = await sheet.getRows();
      const row = rows.find(r => r.rowNumber === parseInt(req.params.rowNumber));
      if (!row) return res.status(404).json({ error: 'Tarefa não encontrada' });

      await row.delete();
      res.json({ message: 'Tarefa deletada' });
      invalidateCache('tarefas');
    } finally {
      release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:rowNumber/comentarios', async (req, res) => {
  try {
    const mutex = getSheetMutex('Tarefas');
    const release = await mutex.acquire();
    try {
      const doc = await getDoc();
      const sheet = doc.sheetsByTitle['Tarefas'];
      const rows = await sheet.getRows();
      const row = rows.find(r => r.rowNumber === parseInt(req.params.rowNumber));
      if (!row) return res.status(404).json({ error: 'Tarefa não encontrada' });

      let comentarios = [];
      try {
        comentarios = row.get('Comentários') ? JSON.parse(row.get('Comentários')) : [];
      } catch (e) {
        comentarios = [];
      }

      comentarios.push({
        id: Date.now().toString(),
        texto: req.body.texto,
        autor: req.body.autor,
        data: req.body.data
      });

      row.set('Comentários', JSON.stringify(comentarios));
      await row.save();
      res.json({ message: 'Comentário adicionado com sucesso', comentarios });
      invalidateCache('tarefas');
    } finally {
      release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
