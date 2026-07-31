import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Configuração do SQLite
const dbPath = path.join(__dirname, 'dados_empresa.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Criar tabela de exemplo se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Rotas CRUD
app.get('/api/registros', (req, res) => {
  try {
    const registros = db.prepare('SELECT * FROM registros ORDER BY id DESC').all();
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/registros', (req, res) => {
  const { titulo, descricao } = req.body;
  if (!titulo) return res.status(400).json({ error: 'Título é obrigatório' });
  
  try {
    const stmt = db.prepare('INSERT INTO registros (titulo, descricao) VALUES (?, ?)');
    const info = stmt.run(titulo, descricao);
    const novoRegistro = db.prepare('SELECT * FROM registros WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(novoRegistro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/registros/:id', (req, res) => {
  const { titulo, descricao } = req.body;
  const { id } = req.params;
  
  try {
    const stmt = db.prepare('UPDATE registros SET titulo = ?, descricao = ? WHERE id = ?');
    const info = stmt.run(titulo, descricao, id);
    if (info.changes === 0) return res.status(404).json({ error: 'Registro não encontrado' });
    const atualizado = db.prepare('SELECT * FROM registros WHERE id = ?').get(id);
    res.json(atualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/registros/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM registros WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json({ message: 'Registro deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota de Backup (.db)
app.get('/api/admin/backup', async (req, res) => {
  try {
    const backupFileName = \`backup_dados_\${Date.now()}.db\`;
    const backupPath = path.join(__dirname, backupFileName);
    
    await db.backup(backupPath);
    
    res.download(backupPath, backupFileName, (err) => {
      if (err) {
        console.error('Erro ao fazer download do backup:', err);
      }
      // Deletar o arquivo temporário após o download
      fs.unlink(backupPath, (unlinkErr) => {
        if(unlinkErr) console.error('Erro ao deletar arquivo de backup temporário:', unlinkErr);
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(\`Servidor rodando na porta \${PORT}\`);
});
