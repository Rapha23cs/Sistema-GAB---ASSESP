export const cache = {};
const CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Executa uma função fetcher utilizando cache em memória.
 * Se houver uma requisição em andamento, retorna a promise dela.
 * @param {string} key - Chave única do cache
 * @param {function} fetcher - Função assíncrona que busca os dados
 * @returns {Promise<any>}
 */
export const withCache = async (key, fetcher) => {
  const now = Date.now();
  
  if (cache[key]) {
    if (now - cache[key].timestamp < CACHE_TTL) {
      return await cache[key].promise;
    }
  }
  
  const promise = fetcher();
  cache[key] = { promise, timestamp: now };
  
  try {
    const data = await promise;
    return data;
  } catch (error) {
    // Em caso de erro, limpa o cache para que a próxima tentativa tente novamente
    delete cache[key];
    throw error;
  }
};

/**
 * Invalida o cache para uma chave específica ou para tudo
 * @param {string} [key] - Chave opcional. Se não fornecida, limpa tudo.
 */
export const invalidateCache = (key) => {
  if (key) {
    delete cache[key];
  } else {
    for (let k in cache) delete cache[k];
  }
};
