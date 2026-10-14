import { PDFParse } from 'pdf-parse';

export async function parsePdfBuffer(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const [textResult, infoResult] = await Promise.all([
      parser.getText(),
      parser.getInfo().catch(() => ({ total: 0 }))
    ]);
    return { text: String(textResult.text || '').slice(0, 120000), pageCount: Number(infoResult.total || 0) };
  } finally {
    await parser.destroy().catch(() => {});
  }
}
