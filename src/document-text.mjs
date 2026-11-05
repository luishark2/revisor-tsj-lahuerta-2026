import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { RequestError } from "./errors.mjs";

export const MAX_DOCUMENT_CHARS = 80_000;
const MAX_DOCX_EXPANDED_BYTES = 50 * 1024 * 1024;

export function validateDocxArchive(buffer) {
  const firstPossibleEnd = Math.max(0, buffer.length - 22 - 0xffff);
  let endOfCentralDirectory = -1;
  for (let offset = buffer.length - 22; offset >= firstPossibleEnd; offset -= 1) {
    if (
      buffer.readUInt32LE(offset) === 0x06054b50 &&
      offset + 22 + buffer.readUInt16LE(offset + 20) === buffer.length
    ) {
      endOfCentralDirectory = offset;
      break;
    }
  }
  if (endOfCentralDirectory < 0) {
    throw new RequestError(422, "El archivo DOCX no contiene una estructura ZIP válida.");
  }

  const entries = buffer.readUInt16LE(endOfCentralDirectory + 10);
  const directorySize = buffer.readUInt32LE(endOfCentralDirectory + 12);
  const directoryOffset = buffer.readUInt32LE(endOfCentralDirectory + 16);
  const directoryEnd = directoryOffset + directorySize;
  if (directoryEnd > endOfCentralDirectory || directoryEnd > buffer.length) {
    throw new RequestError(422, "El archivo DOCX no contiene una estructura ZIP válida.");
  }

  let totalExpandedBytes = 0;
  let offset = directoryOffset;
  for (let index = 0; index < entries; index += 1) {
    if (offset + 46 > directoryEnd || buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new RequestError(422, "El archivo DOCX no contiene una estructura ZIP válida.");
    }

    const compressedBytes = buffer.readUInt32LE(offset + 20);
    const expandedBytes = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const entryEnd = offset + 46 + nameLength + extraLength + commentLength;
    if (
      compressedBytes === 0xffffffff ||
      expandedBytes === 0xffffffff ||
      entryEnd > directoryEnd
    ) {
      throw new RequestError(422, "El archivo DOCX tiene una estructura ZIP no compatible.");
    }

    totalExpandedBytes += expandedBytes;
    if (totalExpandedBytes > MAX_DOCX_EXPANDED_BYTES) {
      throw new RequestError(413, "El DOCX excede el tamaño de procesamiento permitido.");
    }
    offset = entryEnd;
  }

  if (offset !== directoryEnd) {
    throw new RequestError(422, "El archivo DOCX no contiene una estructura ZIP válida.");
  }
}

export async function extractDocumentText(file) {
  const extension = file.originalname.toLowerCase().split(".").pop();
  let text;

  if (extension === "pdf" && file.buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const parsed = await parser.getText();
      text = parsed && typeof parsed.text === "string" ? parsed.text : "";
    } catch {
      throw new RequestError(422, "No se pudo leer el PDF. Verifica que no esté dañado o protegido.");
    } finally {
      await parser.destroy();
    }
  } else if (extension === "docx" && file.buffer.subarray(0, 4).toString("hex") === "504b0304") {
    validateDocxArchive(file.buffer);
    try {
      const parsed = await mammoth.extractRawText({ buffer: file.buffer });
      text = parsed && typeof parsed.value === "string" ? parsed.value : "";
    } catch {
      throw new RequestError(422, "No se pudo leer el documento DOCX. Verifica que no esté dañado.");
    }
  } else {
    throw new RequestError(415, "Adjunta un archivo PDF o DOCX válido.");
  }

  if (typeof text !== "string") {
    throw new RequestError(422, "No se encontró texto legible. Si el PDF es escaneado, aplica OCR antes de subirlo.");
  }

  const normalized = text.replace(/\u0000/g, "").trim();
  if (!normalized) {
    throw new RequestError(422, "No se encontró texto legible. Si el PDF es escaneado, aplica OCR antes de subirlo.");
  }

  return {
    text: normalized.slice(0, MAX_DOCUMENT_CHARS),
    truncated: normalized.length > MAX_DOCUMENT_CHARS
  };
}
