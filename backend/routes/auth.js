import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDoc } from '../googleSheets.js';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-padrao-segura-123';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'Preencha todos os campos.' });

    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Usuários'];
    if (!sheet) return res.status(500).json({ error: 'Aba de usuários não encontrada.' });

    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    if (rows.some(r => r.get('Email') === email)) {
      return res.status(400).json({ error: 'Este email já está em uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

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

router.post('/login', async (req, res) => {
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

    const token = jwt.sign(
      { id: userRow.get('ID'), email: userRow.get('Email'), role: userRow.get('Role'), nome: userRow.get('Nome') },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { nome: userRow.get('Nome'), email: userRow.get('Email'), role: userRow.get('Role') } });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { nome, email } = req.body;
    if (!nome || !email) return res.status(400).json({ error: 'Nome e email são obrigatórios.' });

    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Usuários'];
    if (!sheet) return res.status(500).json({ error: 'Aba de usuários não encontrada.' });

    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    if (rows.some(r => r.get('Email') === email && r.get('ID') !== req.user.id)) {
      return res.status(400).json({ error: 'Este email já está em uso por outra conta.' });
    }

    const userRow = rows.find(r => r.get('ID') === req.user.id);
    if (!userRow) return res.status(404).json({ error: 'Usuário não encontrado.' });

    userRow.set('Nome', nome);
    userRow.set('Email', email);
    await userRow.save();

    const token = jwt.sign(
      { id: userRow.get('ID'), email: userRow.get('Email'), role: userRow.get('Role'), nome: userRow.get('Nome') },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { nome: userRow.get('Nome'), email: userRow.get('Email'), role: userRow.get('Role') } });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

router.get('/users', async (req, res) => {
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

router.put('/users/:id/approve', async (req, res) => {
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

router.delete('/users/:id', async (req, res) => {
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

export default router;
