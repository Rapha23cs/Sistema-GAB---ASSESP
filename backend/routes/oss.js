import express from 'express';
import { getDoc } from '../googleSheets.js';
import { OS_SHEETS, updateEquipmentStatus } from '../utils/sheetsConfig.js';
import { getSheetMutex } from '../utils/mutex.js';
import { withCache, invalidateCache } from '../utils/cache.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await withCache('oss', async () => {
      const doc = await getDoc();
      let todasOSs = [];

      for (const conf of OS_SHEETS) {
        const sheet = doc.sheetsByTitle[conf.title];
        if (sheet) {
          await sheet.loadHeaderRow(conf.headerRow);
          const rows = await sheet.getRows();

          const oss = rows
            .filter(row => row.get('ORDEM DE SERVIÇO') || row.get('PROCESSO'))
            .map(row => ({
              id: row.rowNumber,
              categoria: conf.category,
              sheetTitle: conf.title,
              contrato: row.get('CONTRATO'),
              processo: row.get('PROCESSO'),
              ordem_servico: row.get('ORDEM DE SERVIÇO'),
              equipamento: row.get('EQUIPAMENTO'),
              sei: row.get('SEI'),
              tipo_servico: row.get('TIPO DE SERVIÇO'),
              modelo: row.get('MODELO'),
              numero_serie: row.get('N° DE SÉRIE'),
              unidade: row.get('UNIDADE'),
              data_assinatura: row.get('DATA DE ASSINATURA - DG/PPMA'),
              data_tarefa: row.get('DATA DA TAREFA'),
              data_tratativa: row.get('DATA DA TRATATIVA'),
              tarefa: row.get('TAREFA'),
              tratativa: row.get('TRATATIVA'),
              observacoes_tarefa: row.get('OBSERVAÇÕES DA TAREFA'),
              observacoes_tratativa: row.get('OBSERVAÇÕES DA TRATATIVA') || row.get('OBSERVARÇÕES DA TRATATIVA'),
              status: row.get('STATUS'),
              cronograma: row.get('CRONOGRAMA'),
              link_ordem: row.get('LINK ORDEM'),
              link_tarefa: row.get('LINK TAREFA'),
              link_tratativa: row.get('LINK TRATATIVA')
            }));
          todasOSs = [...todasOSs, ...oss];
        }
      }
      return todasOSs.reverse();
    });
    res.json(data);
  } catch (error) {
    console.error('Erro GET OSs:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const data = req.body;
  const items = Array.isArray(data) ? data : [data];

  if (items.length === 0) return res.status(400).json({ error: 'Nenhum dado enviado' });

  try {
    const conf = OS_SHEETS.find(c => c.category === items[0].categoria);
    if (!conf) return res.status(400).json({ error: 'Categoria de OS inválida' });

    const mutex = getSheetMutex(conf.title);
    const release = await mutex.acquire();
    try {
      const doc = await getDoc();
      const sheet = doc.sheetsByTitle[conf.title];
      if (!sheet) return res.status(404).json({ error: `Aba ${conf.title} não encontrada` });

      await sheet.loadHeaderRow(conf.headerRow);

      const rowsToAdd = items.map(item => {
        let contratoForcado = item.contrato;
        let processoForcado = item.processo;
        if (conf.category === 'Bodyscan') {
          contratoForcado = 'N° 002/2024 - VMI';
          processoForcado = '167633/2023';
        }
        if (conf.category === 'Esteira Raio-x') {
          contratoForcado = 'N° 056/2026 - TECHSCAN';
          processoForcado = '02406/2025';
        }

        return {
          'CONTRATO': contratoForcado || '',
          'PROCESSO': processoForcado || '',
          'ORDEM DE SERVIÇO': item.ordem_servico || '',
          'EQUIPAMENTO': item.equipamento || '',
          'SEI': item.sei || '',
          'TIPO DE SERVIÇO': item.tipo_servico || '',
          'MODELO': item.modelo || '',
          'N° DE SÉRIE': item.numero_serie || '',
          'UNIDADE': item.unidade || '',
          'DATA DE ASSINATURA - DG/PPMA': item.data_assinatura || '',
          'DATA DA TAREFA': item.data_tarefa || '',
          'DATA DA TRATATIVA': item.data_tratativa || '',
          'TAREFA': item.tarefa || '',
          'TRATATIVA': item.tratativa || '',
          'OBSERVAÇÕES DA TAREFA': item.observacoes_tarefa || '',
          'OBSERVAÇÕES DA TRATATIVA': item.observacoes_tratativa || '',
          'STATUS': item.status || '',
          'LINK ORDEM': item.link_ordem || '',
          'LINK TAREFA': item.link_tarefa || '',
          'LINK TRATATIVA': item.link_tratativa || ''
        };
      });

      const newRows = await sheet.addRows(rowsToAdd);

      // Automação: Atualizar status do equipamento baseado na OS
      try {
        for (const item of items) {
          if (item.tipo_servico && item.tipo_servico.toLowerCase() === 'corretiva') {
            if (item.status === 'CONCLUIDO' || item.status === 'CONCLUÍDO') {
              await updateEquipmentStatus(doc, item.categoria, item.numero_serie, 'OPERANTE');
            } else if (!item.status || !item.status.includes('PENDENTE')) {
              await updateEquipmentStatus(doc, item.categoria, item.numero_serie, 'INOPERANTE');
            }
          }
        }
      } catch (e) {
        console.error('Erro na automação OS -> Equipamento:', e);
      }

      invalidateCache('oss');
      invalidateCache('equipamentos');
      res.status(201).json({ message: "OS criadas com sucesso", count: newRows.length });
    } finally {
      release();
    }
  } catch (error) {
    console.error('Erro POST OSs:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const conf = OS_SHEETS.find(c => c.category === data.categoria);
    if (!conf) return res.status(400).json({ error: 'Categoria inválida' });

    const mutex = getSheetMutex(conf.title);
    const release = await mutex.acquire();
    try {
      const doc = await getDoc();
      const sheet = doc.sheetsByTitle[conf.title];
      if (!sheet) return res.status(404).json({ error: `Aba ${conf.title} não encontrada` });

      await sheet.loadHeaderRow(conf.headerRow);
      const rows = await sheet.getRows();
      const rowToUpdate = rows.find(r => r.rowNumber === parseInt(id));

      if (!rowToUpdate) return res.status(404).json({ error: 'OS não encontrada' });

      let contratoForcado = data.contrato;
      let processoForcado = data.processo;
      if (conf.category === 'Bodyscan') {
        contratoForcado = 'N° 002/2024 - VMI';
        processoForcado = '167633/2023';
      }
      if (conf.category === 'Esteira Raio-x') {
        contratoForcado = 'N° 056/2026 - TECHSCAN';
        processoForcado = '02406/2025';
      }

      const rowData = {};
      if (contratoForcado !== undefined) rowData['CONTRATO'] = contratoForcado;
      if (processoForcado !== undefined) rowData['PROCESSO'] = processoForcado;
      if (data.ordem_servico !== undefined) rowData['ORDEM DE SERVIÇO'] = data.ordem_servico;
      if (data.equipamento !== undefined) rowData['EQUIPAMENTO'] = data.equipamento;
      if (data.sei !== undefined) rowData['SEI'] = data.sei;
      if (data.tipo_servico !== undefined) rowData['TIPO DE SERVIÇO'] = data.tipo_servico;
      if (data.modelo !== undefined) rowData['MODELO'] = data.modelo;
      if (data.numero_serie !== undefined) rowData['N° DE SÉRIE'] = data.numero_serie;
      if (data.unidade !== undefined) rowData['UNIDADE'] = data.unidade;
      if (data.data_assinatura !== undefined) rowData['DATA DE ASSINATURA - DG/PPMA'] = data.data_assinatura;
      if (data.data_tarefa !== undefined) rowData['DATA DA TAREFA'] = data.data_tarefa;
      if (data.data_tratativa !== undefined) rowData['DATA DA TRATATIVA'] = data.data_tratativa;
      if (data.tarefa !== undefined) rowData['TAREFA'] = data.tarefa;
      if (data.tratativa !== undefined) rowData['TRATATIVA'] = data.tratativa;
      if (data.observacoes_tarefa !== undefined) rowData['OBSERVAÇÕES DA TAREFA'] = data.observacoes_tarefa;
      if (data.observacoes_tratativa !== undefined) rowData['OBSERVAÇÕES DA TRATATIVA'] = data.observacoes_tratativa;
      if (data.status !== undefined) rowData['STATUS'] = data.status;
      if (data.link_ordem !== undefined) rowData['LINK ORDEM'] = data.link_ordem;
      if (data.link_tarefa !== undefined) rowData['LINK TAREFA'] = data.link_tarefa;
      if (data.link_tratativa !== undefined) rowData['LINK TRATATIVA'] = data.link_tratativa;

      rowToUpdate.assign(rowData);
      await rowToUpdate.save();

      try {
        const tipoServico = data.tipo_servico || rowToUpdate.get('TIPO DE SERVIÇO') || '';
        const numeroSerie = data.numero_serie || rowToUpdate.get('N° DE SÉRIE') || '';
        const statusFinal = data.status || rowToUpdate.get('STATUS') || '';

        if (tipoServico.toLowerCase() === 'corretiva') {
          if (statusFinal === 'CONCLUIDO' || statusFinal === 'CONCLUÍDO') {
            await updateEquipmentStatus(doc, data.categoria, numeroSerie, 'OPERANTE');
          } else if (!statusFinal || !statusFinal.includes('PENDENTE')) {
            await updateEquipmentStatus(doc, data.categoria, numeroSerie, 'INOPERANTE');
          }
        }
      } catch (e) {
        console.error('Erro na automação OS -> Equipamento:', e);
      }

      invalidateCache('oss');
      invalidateCache('equipamentos');
      res.json({ ...data, id: rowToUpdate.rowNumber, sheetTitle: conf.title });
    } finally {
      release();
    }
  } catch (error) {
    console.error('Erro PUT OSs:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const categoria = req.query.categoria;

  try {
    const conf = OS_SHEETS.find(c => c.category === categoria);
    if (!conf) return res.status(400).json({ error: 'Categoria inválida para deleção' });

    const mutex = getSheetMutex(conf.title);
    const release = await mutex.acquire();
    try {
      const doc = await getDoc();
      const sheet = doc.sheetsByTitle[conf.title];
      if (!sheet) return res.status(404).json({ error: `Aba ${conf.title} não encontrada` });

      await sheet.loadHeaderRow(conf.headerRow);
      const rows = await sheet.getRows();
      const rowToDelete = rows.find(r => r.rowNumber === parseInt(id));

      if (!rowToDelete) return res.status(404).json({ error: 'OS não encontrada' });

      await rowToDelete.delete();
      invalidateCache('oss');
      invalidateCache('equipamentos');
      res.json({ message: 'OS deletada' });
    } finally {
      release();
    }
  } catch (error) {
    console.error('Erro DELETE OSs:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
