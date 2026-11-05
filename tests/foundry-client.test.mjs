import assert from "node:assert/strict";
import { test } from "node:test";
import { askFoundryAgent } from "../src/foundry-client.mjs";

test("invokes the configured Foundry agent with a server-side Entra token", async () => {
  const originalFetch = globalThis.fetch;
  let tokenScope;
  globalThis.fetch = async (url, options) => {
    assert.equal(
      url,
      "https://example.services.ai.azure.com/api/projects/test-project/agents/Revisor-TSJ-Minimal/endpoint/protocols/openai/responses?api-version=v1"
    );
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, "Bearer test-token");
    assert.deepEqual(JSON.parse(options.body), {
      input: [{
        type: "message",
        role: "user",
        content: "Revisa mi cita APA 7."
      }],
      store: false
    });
    return new Response(JSON.stringify({
      output: [{ content: [{ type: "output_text", text: "Revisión completada." }] }]
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  try {
    const reply = await askFoundryAgent(
      [{ role: "user", content: "Revisa mi cita APA 7." }],
      {
        projectEndpoint: "https://example.services.ai.azure.com/api/projects/test-project",
        agentName: "Revisor-TSJ-Minimal",
        credential: {
          getToken: async (scope) => {
            tokenScope = scope;
            return { token: "test-token" };
          }
        }
      }
    );
    assert.equal(tokenScope, "https://ai.azure.com/.default");
    assert.equal(reply, "Revisión completada.");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects a non-HTTPS or malformed Foundry endpoint", async () => {
  await assert.rejects(
    askFoundryAgent([], {
      projectEndpoint: "http://example.test/api/projects/test-project",
      agentName: "Revisor-TSJ-Minimal",
      credential: { getToken: async () => ({ token: "unused" }) }
    }),
    /HTTPS project URL/
  );
});
