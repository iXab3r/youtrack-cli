import assert from "node:assert/strict";
import { test } from "node:test";
import { getIssue, getGlobalSettings } from "../src/index.js";

test("known bearer values are scrubbed from canonical URI echoes outside URLs", async () => {
  const token = "synthetic-token/with+punctuation"; const encoded = encodeURIComponent(token);
  const result = await getIssue({ baseUrl: "https://echo.example.test", token, fetch: (async () => Response.json({ id: "synthetic", encoded: `native=${encoded}`, [encoded]: "synthetic-value" })) as typeof fetch }, "synthetic");
  assert(!JSON.stringify(result).includes(token)); assert(!JSON.stringify(result).includes(encoded));
});

test("native license values are scrubbed from raw JSON and URI echoes outside URLs", async () => {
  const license = 'synthetic-license/with+quotes"\\'; const encoded = encodeURIComponent(license);
  const result = await getGlobalSettings({ baseUrl: "https://echo.example.test", token: "synthetic-token", fetch: (async () => Response.json({ license: { license }, encoded: `native=${encoded}`, metadata: JSON.stringify({ encoded }), [encoded]: license })) as typeof fetch });
  const serialized = JSON.stringify(result); assert(!serialized.includes(license)); assert(!serialized.includes(encoded));
});

test("credential scrubbing keeps JSON-supported lone surrogates safe without new charset rules", async () => {
  const license = "synthetic-license\ud800";
  const result = await getGlobalSettings({ baseUrl: "https://echo.example.test", token: "synthetic-token", fetch: (async () => Response.json({ license: { license }, echo: JSON.stringify({ license }) })) as typeof fetch });
  assert.deepEqual(result, { license: { license: "[redacted]" }, echo: '{"license":"[redacted]"}' });
});
