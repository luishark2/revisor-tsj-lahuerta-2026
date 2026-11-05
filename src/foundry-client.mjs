import { DefaultAzureCredential } from "@azure/identity";

const TOKEN_SCOPE = "https://ai.azure.com/.default";
const REQUEST_TIMEOUT_MS = 120_000;

function getAgentEndpoint(projectEndpoint, agentName) {
  const base = projectEndpoint.replace(/\/+$/, "");
  return `${base}/agents/${encodeURIComponent(agentName)}/endpoint/protocols/openai/responses?api-version=v1`;
}

function readResponseText(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Foundry returned an invalid response.");
  }

  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const collectText = (value) => {
    if (Array.isArray(value)) {
      return value.flatMap(collectText);
    }

    if (!value || typeof value !== "object") {
      return [];
    }

    const nested = [];
    if (typeof value.text === "string" && value.text.trim()) {
      nested.push(value.text.trim());
    }

    if (Array.isArray(value.content)) {
      nested.push(...value.content.flatMap(collectText));
    }

    if (Array.isArray(value.output)) {
      nested.push(...value.output.flatMap(collectText));
    }

    return nested;
  };

  const text = collectText(payload.output)
    .filter((item) => typeof item === "string" && item.trim())
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Foundry returned no text in its response.");
  }
  return text;
}

export async function askFoundryAgent(input, options = {}) {
  const projectEndpoint = options.projectEndpoint ?? process.env.FOUNDRY_PROJECT_ENDPOINT;
  const agentName = options.agentName ?? process.env.FOUNDRY_AGENT_NAME;
  if (!projectEndpoint || !agentName) {
    throw new Error("Foundry project endpoint and agent name are required.");
  }

  const endpointUrl = new URL(projectEndpoint);
  if (
    endpointUrl.protocol !== "https:" ||
    endpointUrl.username ||
    endpointUrl.password ||
    endpointUrl.search ||
    endpointUrl.hash ||
    !/^\/api\/projects\/[^/]+\/?$/.test(endpointUrl.pathname)
  ) {
    throw new Error("Foundry project endpoint must be an HTTPS project URL without embedded credentials.");
  }

  const credential = options.credential ?? new DefaultAzureCredential();
  const accessToken = await credential.getToken(TOKEN_SCOPE);
  if (!accessToken) {
    throw new Error("Azure identity did not return an access token.");
  }

  const response = await fetch(getAgentEndpoint(projectEndpoint, agentName), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      input: input.map(({ role, content }) => ({
        type: "message",
        role,
        content
      })),
      store: false
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`Foundry agent request failed with status ${response.status}.`);
  }

  return readResponseText(await response.json());
}
