import xlsx from 'xlsx';

try {
  const workbook = xlsx.readFile('CONTROLE GERAL - SAL_PPMA (Nova Versão).xlsx');
  const sheetNames = workbook.SheetNames;

  console.log("Planilhas encontradas:");
  sheetNames.forEach(sheet => {
    console.log(`\n--- Planilha: ${sheet} ---`);
    const worksheet = workbook.Sheets[sheet];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    if (data.length > 0) {
      console.log("Colunas:", data[0]);
    } else {
      console.log("Planilha vazia");
    }
  });
} catch (error) {
  console.error("Erro ao ler arquivo:", error);
}
