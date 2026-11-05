import assert from "node:assert/strict";
import { test } from "node:test";
import { extractDocumentText, validateDocxArchive } from "../src/document-text.mjs";
import { RequestError } from "../src/errors.mjs";

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createStoredZip(entries) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;

  for (const [name, content] of Object.entries(entries)) {
    const nameBytes = Buffer.from(name);
    const contentBytes = Buffer.from(content);
    const checksum = crc32(contentBytes);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(contentBytes.length, 18);
    localHeader.writeUInt32LE(contentBytes.length, 22);
    localHeader.writeUInt16LE(nameBytes.length, 26);
    localParts.push(localHeader, nameBytes, contentBytes);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(contentBytes.length, 20);
    centralHeader.writeUInt32LE(contentBytes.length, 24);
    centralHeader.writeUInt16LE(nameBytes.length, 28);
    centralHeader.writeUInt32LE(localOffset, 42);
    centralParts.push(centralHeader, nameBytes);
    localOffset += localHeader.length + nameBytes.length + contentBytes.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(Object.keys(entries).length, 8);
  endRecord.writeUInt16LE(Object.keys(entries).length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(localOffset, 16);
  return Buffer.concat([...localParts, centralDirectory, endRecord]);
}

function makeDocumentFile(buffer, name, mimetype) {
  return { buffer, originalname: name, mimetype };
}

function createPdf(text) {
  const stream = `BT /F1 12 Tf 72 72 Td (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`
  ];
  let content = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(content, "binary"));
    content += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(content, "binary");
  content += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    content += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  content += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(content, "binary");
}

test("extracts text from a valid PDF in memory", async () => {
  const file = makeDocumentFile(createPdf("Hola residencia profesional"), "residencia.pdf", "application/pdf");
  const result = await extractDocumentText(file);
  assert.match(result.text, /Hola residencia profesional/);
  assert.equal(result.truncated, false);
});

test("extracts text from a valid DOCX in memory", async () => {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
  const documentXml = `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Informe de residencia</w:t></w:r></w:p><w:sectPr/></w:body></w:document>`;
  const file = makeDocumentFile(
    createStoredZip({ "[Content_Types].xml": contentTypes, "word/document.xml": documentXml }),
    "residencia.docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );

  const result = await extractDocumentText(file);
  assert.equal(result.text, "Informe de residencia");
  assert.equal(result.truncated, false);
});

test("rejects malformed or oversized DOCX archives before extraction", () => {
  assert.throws(
    () => validateDocxArchive(Buffer.alloc(32)),
    (error) => error instanceof RequestError && error.status === 422
  );

  const header = Buffer.alloc(47);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt32LE(1, 20);
  header.writeUInt32LE(51 * 1024 * 1024, 24);
  header.writeUInt16LE(1, 28);
  header.write("x", 46);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(1, 8);
  endRecord.writeUInt16LE(1, 10);
  endRecord.writeUInt32LE(header.length, 12);
  endRecord.writeUInt32LE(0, 16);

  assert.throws(
    () => validateDocxArchive(Buffer.concat([header, endRecord])),
    (error) => error instanceof RequestError && error.status === 413
  );
});
