import { Mutex } from 'async-mutex';

// Um Map para armazenar Mutexes únicos por nome de aba
const sheetMutexes = new Map();

/**
 * Retorna um Mutex (trava de exclusão mútua) exclusivo para uma aba específica do Google Sheets.
 * Isso garante que operações concorrentes de salvar linhas não sobrescrevam umas às outras.
 * @param {string} sheetName O nome da aba (ex: 'OS_SHEETS', 'EQUIPMENT_SHEET')
 * @returns {Mutex}
 */
export const getSheetMutex = (sheetName) => {
  if (!sheetMutexes.has(sheetName)) {
    sheetMutexes.set(sheetName, new Mutex());
  }
  return sheetMutexes.get(sheetName);
};
