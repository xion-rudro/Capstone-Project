import { PDFParse } from 'pdf-parse';

export async function parsePdfPageCount(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const info = await parser.getInfo().catch(() => ({ total: 0 }));
    return Number(info.total || 0);
  } finally {
    await parser.destroy().catch(() => {});
  }
}
