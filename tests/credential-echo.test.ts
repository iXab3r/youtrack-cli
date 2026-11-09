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

test("known bearer URI echoes match lower and mixed percent-triplet hex case", async () => {
  const token = "Synthetic-token/with+punctuation"; const canonical = encodeURIComponent(token);
  for (const encoded of [canonical.replace(/%[0-9A-F]{2}/g, part => part.toLowerCase()), canonical.replace("%2F", "%2f")]) {
    const result = await getIssue({ baseUrl: "https://echo.example.test", token, fetch: (async () => Response.json({ encoded: `native=${encoded}`, [encoded]: "synthetic" })) as typeof fetch }, "synthetic");
    assert(!JSON.stringify(result).includes(encoded));
  }
});

test("known native-license URI echoes match lower and mixed percent-triplet hex case", async () => {
  const license = 'SeCrEt-license/with+quotes"\\'; const canonical = encodeURIComponent(license);
  for (const encoded of [canonical.replace(/%[0-9A-F]{2}/g, part => part.toLowerCase()), canonical.replace("%2F", "%2f")]) {
    const result = await getGlobalSettings({ baseUrl: "https://echo.example.test", token: "synthetic-token", fetch: (async () => Response.json({ license: { license }, encoded: `native=${encoded}`, [encoded]: license })) as typeof fetch });
    assert(!JSON.stringify(result).includes(encoded));
  }
});

test("credential URI matching preserves ordinary-letter case and literal punctuation", async () => {
  const license = 'SeCrEt-license/with+[punct].*(x)?$^{}|\\'; const encoded = encodeURIComponent(license);
  const controls = [encoded.replace("SeCrEt", "secret"), encoded.replace(".*(x)", ".differentx")];
  const result = await getGlobalSettings({ baseUrl: "https://echo.example.test", token: "synthetic-token", fetch: (async () => Response.json({ license: { license }, controls })) as typeof fetch });
  assert.deepEqual(result.controls, controls);
});

test("credential matching also covers later copies with escaped C0 and C1 controls", async () => {
  const license = 'synthetic-license"\\\u0001\u0085\n\t';
  const escaped = license.replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4,"0")}`);
  const result = await getGlobalSettings({ baseUrl: "https://echo.example.test", token: "synthetic-token", fetch: (async () => Response.json({ license: { license }, copied: escaped, metadata: JSON.stringify({ license: escaped }) })) as typeof fetch });
  assert.deepEqual(result, { license: { license: "[redacted]" }, copied: "[redacted]", metadata: '{"license":"[redacted]"}' });
});

test("credential matching keeps ordinary letters literal after a preceding percent sign", async () => {
  for (const license of ["af%q", "ab%synthetic-license"]) {
    const copied = ["%" + license, "%" + encodeURIComponent(license)];
    const result = await getGlobalSettings({ baseUrl: "https://echo.example.test", token: "synthetic-token", fetch: (async () => Response.json({ license: { license }, copied, ...Object.fromEntries(copied.map(form => [form, form])) })) as typeof fetch });
    assert.deepEqual(result.copied, ["%[redacted]", "%[redacted]"]);
    assert.equal(result["%[redacted]"], "%[redacted]");
  }
});

test("percent signs outside a candidate cannot case-fold ordinary credential letters", async () => {
  const license = "AF%q"; const controls = ["%af%q", "%af%25q", "unrelated%ab-native"];
  const result = await getGlobalSettings({ baseUrl: "https://echo.example.test", token: "synthetic-token", fetch: (async () => Response.json({ license: { license }, controls, ...Object.fromEntries(controls.map(form => [form, form])) })) as typeof fetch });
  assert.deepEqual(result.controls, controls);
  for (const control of controls) assert.equal(result[control], control);
});


test("native license echoes stay known when URL masking changes the original license field", async () => {
  const license = "ab%synthetic/license"; const encoded = encodeURIComponent(license);
  const result = await getGlobalSettings({ baseUrl: "https://echo.example.test", token: "synthetic-token", fetch: (async () => Response.json({ license: { license }, copied: "%" + encoded, ["%" + encoded]: "synthetic" })) as typeof fetch });
  assert(!JSON.stringify(result).includes(encoded));
});
