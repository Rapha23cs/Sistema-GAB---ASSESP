export const EQUIP_SHEETS = [
  { title: 'Esteira Raio-x (status)', headerRow: 5, category: 'Esteira Raio-x' },
  { title: 'Bodyscan (status)', headerRow: 5, category: 'Bodyscan' },
  { title: 'Pórticos (status)', headerRow: 4, category: 'Pórticos' }
];

export const OS_SHEETS = [
  { category: 'Bodyscan', title: 'Ordens de Serviço - Bodyscan', headerRow: 5 },
  { category: 'Esteira Raio-x', title: 'Ordens de Serviço - Esteiras', headerRow: 5 }
];

export async function updateEquipmentStatus(doc, categoria, numeroSerie, newStatus) {
  if (!numeroSerie) return;
  const conf = EQUIP_SHEETS.find(c => c.category === categoria);
  if (!conf) return;

  const sheet = doc.sheetsByTitle[conf.title];
  if (!sheet) return;

  await sheet.loadHeaderRow(conf.headerRow);
  const rows = await sheet.getRows();
  const equipRow = rows.find(r => r.get('N° DE SÉRIE') === numeroSerie);

  if (equipRow) {
    equipRow.set('STATUS', newStatus);
    await equipRow.save();
    console.log(`[Automação] Equipamento ${numeroSerie} atualizado para ${newStatus}`);
  }
}
