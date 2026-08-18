import { parse, format, differenceInDays, isValid } from 'date-fns';

/**
 * Tenta fazer o parse de uma string de data em vários formatos comuns
 * no Brasil e ISO, retornando um objeto Date válido ou null.
 */
export const parseAnyDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const str = dateStr.trim().split(' ')[0]; // Pega só a data (ignora hora se tiver)
  let parsedDate;

  if (str.includes('/')) {
    // DD/MM/YYYY
    parsedDate = parse(str, 'dd/MM/yyyy', new Date());
  } else if (str.includes('-')) {
    // YYYY-MM-DD
    parsedDate = parse(str, 'yyyy-MM-dd', new Date());
  }

  return isValid(parsedDate) ? parsedDate : null;
};

/**
 * Retorna o timestamp de uma string de data, útil para ordenação ou Math.max
 */
export const getTimestamp = (dateStr) => {
  const parsed = parseAnyDate(dateStr);
  return parsed ? parsed.getTime() : 0;
};

/**
 * Retorna a diferença em dias entre uma data e hoje.
 * Positivo = Data futura (ainda vai vencer)
 * Negativo = Data passada (já venceu)
 */
export const daysUntil = (dateStr) => {
  const targetDate = parseAnyDate(dateStr);
  if (!targetDate) return null;
  return differenceInDays(targetDate, new Date());
};

/**
 * Formata um objeto Date para DD/MM/YYYY
 */
export const formatDateBr = (dateObj) => {
  if (!dateObj || !isValid(dateObj)) return '';
  return format(dateObj, 'dd/MM/yyyy');
};

/**
 * Formata um objeto Date para DD/MM/YYYY HH:mm:ss
 */
export const formatDateTimeBr = (dateObj) => {
  if (!dateObj || !isValid(dateObj)) return '';
  return format(dateObj, 'dd/MM/yyyy HH:mm:ss');
};
