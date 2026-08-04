import xlsx from 'xlsx';
import Database from 'better-sqlite3';

const db = new Database('dados_empresa.db');

// Criar a tabela contratos
db.exec(`
  DROP TABLE IF EXISTS contratos;
  CREATE TABLE contratos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_contrato TEXT,
    vigencia TEXT,
    processo TEXT,
    tipo TEXT,
    recurso_financeiro TEXT,
    valor_global TEXT,
    valor_mensal TEXT,
    objeto TEXT,
    quantidade TEXT,
    execucao TEXT,
    pendencia TEXT,
    prazo_entrega TEXT,
    status_licitacao TEXT,
    localizacao TEXT,
    consulta TEXT,
    responsavel TEXT
  )
`);

try {
  // Ler o Excel
  const workbook = xlsx.readFile('CONTROLE GERAL - SAL_PPMA (Nova Versão).xlsx');
  const worksheet = workbook.Sheets['Contratos - PPMA'];
  const data = xlsx.utils.sheet_to_json(worksheet, { raw: false, defval: null }); // raw:false garante formato string

  // Inserir os dados
  const insert = db.prepare(`
    INSERT INTO contratos (
      numero_contrato, vigencia, processo, tipo, recurso_financeiro, 
      valor_global, valor_mensal, objeto, quantidade, execucao, 
      pendencia, prazo_entrega, status_licitacao, localizacao, consulta, responsavel
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      if (!row['CONTRATO'] && !row['OBJETO']) continue; // Pular linhas totalmente vazias
      
      insert.run(
        row['CONTRATO'] || null,
        row['VIGÊNCIA'] || null,
        row['PROCESSO "mãe" (SEI ou físico)'] || null,
        row['TIPO (OS/OF)'] || null,
        row['RECURSO FINANCEIRO'] || null,
        row['VALOR GLOBAL (atualizado)'] || null,
        row['VALOR MENSAL'] || null,
        row['OBJETO'] || null,
        row['QUANTIDADE'] || null,
        row['EXECUÇÃO'] || null,
        row['PENDÊNCIA (saldo)'] || null,
        row['PRAZO DE ENTREGA (previsão)'] || null,
        row['STATUS do Proc. Licitatório'] || null,
        row['LOCALIZAÇÃO'] || null,
        row['CONSULTA'] || null,
        row['RESPONSÁVEL'] || null
      );
      count++;
    }
  });

  insertMany(data);
  console.log(`Foram importados ${count} contratos com sucesso!`);
} catch(err) {
  console.error("Erro:", err);
}
