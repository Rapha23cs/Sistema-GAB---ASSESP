const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sistema Gab API is running' });
});

// Get all Users
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Get all Orders (OrdemServico)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.ordemServico.findMany({
      include: {
        tarefas: {
          include: {
            tratativas: true
          }
        }
      }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle Task Status (Checkout)
app.put('/api/tasks/:id/toggle', async (req, res) => {
  const { id } = req.params;
  
  try {
    const task = await prisma.tarefa.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const newStatus = !task.concluida;
    
    const updatedTask = await prisma.tarefa.update({
      where: { id },
      data: { concluida: newStatus }
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Collaboration Tasks
app.get('/api/collab-tasks', async (req, res) => {
  const tasks = await prisma.collabTask.findMany({
    include: { author: true, assignee: true },
    orderBy: { date: 'desc' }
  });
  res.json(tasks);
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
