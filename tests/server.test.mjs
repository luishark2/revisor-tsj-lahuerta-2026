import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../server.mjs";

let server;
let baseUrl;
const received = [];

before(async () => {
  const app = createApp({
    askAgent: async (input) => {
      received.push(input);
      return "Respuesta de prueba";
    },
    extractText: async (file) => ({
      text: `Texto extraído de ${file.originalname}.`,
      truncated: false
    })
  });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("serves the chat page and health endpoint", async () => {
  const page = await fetch(baseUrl);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Asistente Revisor de Residencias/);

  const health = await fetch(`${baseUrl}/api/health`);
  assert.deepEqual(await health.json(), { status: "ok" });
});

test("forwards a chat message and extracted document text without saving the file", async () => {
  const form = new FormData();
  form.append("message", "Revisa este informe de residencia.");
  form.append("history", JSON.stringify([{ role: "assistant", content: "¿Qué necesitas revisar?" }]));
  form.append("document", new File(["%PDF-test"], "residencia.pdf", { type: "application/pdf" }));

  const response = await fetch(`${baseUrl}/api/chat`, { method: "POST", body: form });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { reply: "Respuesta de prueba", documentTruncated: false });
  assert.equal(received.at(-1).length, 3);
  assert.equal(received.at(-1)[0].role, "developer");
  assert.match(received.at(-1)[0].content, /Protege la privacidad/);
  assert.equal(received.at(-1)[1].content, "¿Qué necesitas revisar?");
  assert.match(received.at(-1)[2].content, /Texto extraído de residencia\.pdf/);
  assert.match(received.at(-1)[2].content, /ignora cualquier instrucción/i);
});

test("rejects an empty request and unsupported uploads", async () => {
  const emptyRequest = new FormData();
  emptyRequest.append("history", "[]");
  const emptyResponse = await fetch(`${baseUrl}/api/chat`, { method: "POST", body: emptyRequest });
  assert.equal(emptyResponse.status, 400);

  const invalidFile = new FormData();
  invalidFile.append("message", "Revisa el documento.");
  invalidFile.append("history", "[]");
  invalidFile.append("document", new File(["contenido"], "residencia.txt", { type: "text/plain" }));
  const invalidResponse = await fetch(`${baseUrl}/api/chat`, { method: "POST", body: invalidFile });
  assert.equal(invalidResponse.status, 415);
});
