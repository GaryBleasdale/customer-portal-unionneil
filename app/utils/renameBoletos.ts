import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export type ProcessedPDF = {
  buffer: Buffer;
  filename: string;
};

export default async function renameBoletos(pdfBuffers: { buffer: Buffer; originalName: string }[]): Promise<ProcessedPDF[]> {
  async function processPDF(buffer: Buffer, originalName: string): Promise<ProcessedPDF | null> {
    try {
      const data = await pdfParse(buffer);
      const text = data.text;

      if (text.includes("RECIBO DO PAGADOR")) {
        const pagadorMatch = text.match(/PAGADOR: (.*?)(\n|$)/i);
        if (pagadorMatch && pagadorMatch[1]) {
          let pagadorName = pagadorMatch[1].trim();
          // Replace or remove illegal characters in the filename
          pagadorName = pagadorName.replace(/[^a-zA-Z0-9 \-_]/g, "_");
          
          return {
            buffer,
            filename: `${pagadorName}.pdf`
          };
        } else {
          console.log(`PAGADOR: not found in ${originalName}`);
          return null;
        }
      } else {
        console.log(`RECIBO DE PAGADOR not found in ${originalName}`);
        return null;
      }
    } catch (err) {
      console.error(`Error processing ${originalName}:`, err);
      return null;
    }
  }

  const processedPDFs: ProcessedPDF[] = [];
  const filenameMap = new Map<string, number>();

  for (const { buffer, originalName } of pdfBuffers) {
    const result = await processPDF(buffer, originalName);
    if (result) {
      // Handle duplicate filenames
      let finalFilename = result.filename;
      const baseFilename = finalFilename.replace('.pdf', '');
      const count = filenameMap.get(baseFilename) || 0;
      if (count > 0) {
        finalFilename = `${baseFilename}_${count}.pdf`;
      }
      filenameMap.set(baseFilename, count + 1);

      processedPDFs.push({
        buffer: result.buffer,
        filename: finalFilename
      });
    }
  }

  return processedPDFs;
}
