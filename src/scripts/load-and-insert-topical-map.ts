import { prisma } from 'src/shared';
import * as XLSX from 'xlsx';

type TopicalMapRow = {
  'Categorie'?: string;
  'Type'?: string;
  'Titel Pagina'?: string;
  'URL Pagina'?: string;
  'Kernonderwerp / Beschrijving'?: string;
  'Belangrijkste Zoekwoorden / Long-tail ideeën'?: string;
  'Linkt naar Pillar Pagina'?: string;
  'Linkt naar Cluster Content'?: string;
  'Linkt naar Support Content'?: string;
  'Linkt naar Tools / Case Studies'?: string;
  'Inhoudsopgave'?: string;
  'Samenvatting'?: string;
};

async function main() {
  const workbook = XLSX.readFile('data/topical-map/topical-map-marketing.xlsx');
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('No sheets found in the workbook.');
  }
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<TopicalMapRow>(sheet!);

  for (const row of rows) {
    await prisma.topicalMapEntry.create({
      data: {
        topicalMapId: '7f2cd8ed-1998-4cfc-8c4d-6920ece010f3',
        categorie: row['Categorie'] ?? '',
        type: row['Type']
          ? row['Type'].replace(/[^CPS]/gi, '').toUpperCase()
          : '',
        titelPagina: row['Titel Pagina'] ?? '',
        urlPagina: row['URL Pagina'] ?? '',
        kernonderwerp: row['Kernonderwerp / Beschrijving'] ?? '',
        inhoudsopgave: row['Inhoudsopgave'] ?? '',
        sammenvatting: row['Samenvatting'] ?? '',
        // Split keywords if comma-separated, or wrap in array if single string
        belangrijksteZoekwoorden: row['Belangrijkste Zoekwoorden / Long-tail ideeën']
          ? row['Belangrijkste Zoekwoorden / Long-tail ideeën'].split(',').map(s => s.trim())
          : [],
        longTailIdeeen: [],
        linktNaarPillar: row['Linkt naar Pillar Pagina']
          ? row['Linkt naar Pillar Pagina'].split(',').map(s => s.trim())
          : [],
        linktNaarCluster: row['Linkt naar Cluster Content']
          ? row['Linkt naar Cluster Content'].split(',').map(s => s.trim())
          : [],
        linktNaarSupport: row['Linkt naar Support Content']
          ? row['Linkt naar Support Content'].split(',').map(s => s.trim())
          : [],
        linktNaarTools: row['Linkt naar Tools / Case Studies']
          ? row['Linkt naar Tools / Case Studies'].split(',').map(s => s.trim())
          : [],
        linktNaarBestaande: [],
      },
    });
  }
  console.log('Import complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());