import { PDFParse } from "pdf-parse";

/**
 * Extract text from PDF file
 * @param {Buffer} pdfBuffer - PDF bytes
 * @returns {Promise<{text: string, numPages: number, info: Object}>}
 */
export const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const parser = new PDFParse({ data: pdfBuffer });
    try {
      const data = await parser.getText();

      if (!data.text?.trim()) {
        throw new Error('PDF contains no extractable text');
      }

      return {
        text: data.text,
        numPages: data.total,
      };
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};
