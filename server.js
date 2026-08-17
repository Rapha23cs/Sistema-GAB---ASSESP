import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Middlewares
import { cacheMiddleware, authenticateToken } from './backend/middlewares.js';

// Rotas
import authRoutes from './backend/routes/auth.js';
import contratosRoutes from './backend/routes/contratos.js';
import equipamentosRoutes from './backend/routes/equipamentos.js';
import ossRoutes from './backend/routes/oss.js';
import licitacoesRoutes from './backend/routes/licitacoes.js';
import financeiroRoutes from './backend/routes/financeiro.js';
import tarefasRoutes from './backend/routes/tarefas.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Global Auth Middleware para todas as rotas em /api
app.use('/api', authenticateToken);

// Registro de rotas com cacheMiddleware específico para cada uma
app.use('/api/auth', cacheMiddleware, authRoutes);
app.use('/api/contratos', cacheMiddleware, contratosRoutes);
app.use('/api/equipamentos', cacheMiddleware, equipamentosRoutes);
app.use('/api/oss', cacheMiddleware, ossRoutes);
app.use('/api/licitacoes', cacheMiddleware, licitacoesRoutes);
app.use('/api/financeiro', cacheMiddleware, financeiroRoutes);
app.use('/api/tarefas', cacheMiddleware, tarefasRoutes);

// Servir os arquivos estáticos do frontend em produção
app.use(express.static(path.join(__dirname, 'dist')));

// Redirecionar todas as outras requisições (não-API) para o React (SPA Routing)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} conectado ao Google Sheets!`);
});
