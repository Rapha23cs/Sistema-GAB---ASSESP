import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-padrao-segura-123';

// Cada módulo terá seu próprio cache isolado
const caches = new Map();

function getCacheForRoute(baseUrl) {
  if (!caches.has(baseUrl)) {
    caches.set(baseUrl, new Map());
  }
  return caches.get(baseUrl);
}

export function cacheMiddleware(req, res, next) {
  const baseUrl = req.baseUrl || '/api/geral';
  const cacheMap = getCacheForRoute(baseUrl);
  
  // Se for uma requisição que altera dados (POST, PUT, DELETE), limpa o cache específico dessa rota
  if (req.method !== 'GET') {
    cacheMap.clear();
    return next();
  }

  const key = req.originalUrl;
  const cached = cacheMap.get(key);
  
  // Usa o cache se tiver menos de 5 segundos
  if (cached && (Date.now() - cached.timestamp < 5000)) {
    return res.json(cached.data);
  }

  const originalJson = res.json;
  res.json = function (body) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cacheMap.set(key, { timestamp: Date.now(), data: body });
    }
    return originalJson.call(res, body);
  };
  next();
}

export function authenticateToken(req, res, next) {
  // Ignora verificação para as rotas públicas de auth
  if (req.originalUrl === '/api/auth/login' || req.originalUrl === '/api/auth/register') return next();

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
    req.user = user;
    next();
  });
}
