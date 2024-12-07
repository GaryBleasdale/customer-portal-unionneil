import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import PDFParser from "pdf2json";

export type ProcessedPDF = {
  buffer: Buffer;
  filename: string;
};

export default async function renameBoletos(pdfBuffers: { buffer: Buffer; originalName: string }[]): Promise<ProcessedPDF[]> {
  async function processPDF(buffer: Buffer, originalName: string): Promise<ProcessedPDF | null> {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        try {
          // pdf2json returns encoded text, we need to decode it
          const text = decodeURIComponent(pdfData.Pages[0].Texts.map(text => text.R[0].T).join(' '));

          if (text.includes("RECIBO DO PAGADOR")) {
            const pagadorMatch = text.match(/PAGADOR: (.*?)(\n|$)/i);
            if (pagadorMatch && pagadorMatch[1]) {
              let pagadorName = pagadorMatch[1].trim();
              // Replace or remove illegal characters in the filename
              pagadorName = pagadorName.replace(/[^a-zA-Z0-9 \-_]/g, "_");
              
              resolve({
                buffer,
                filename: `${pagadorName}.pdf`
              });
            } else {
              console.log(`PAGADOR: not found in ${originalName}`);
              resolve(null);
            }
          } else {
            console.log(`RECIBO DE PAGADOR not found in ${originalName}`);
            resolve(null);
          }
        } catch (err) {
          console.error(`Error processing ${originalName}:`, err);
          resolve(null);
        }
      });

      pdfParser.on("pdfParser_dataError", (err) => {
        console.error(`Error parsing ${originalName}:`, err);
        resolve(null);
      });

      // Parse the PDF buffer
      pdfParser.parseBuffer(buffer);
    });
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
