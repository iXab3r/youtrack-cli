import { fields, readObject, readObjectAt, scrub, type Connection, type ProjectionOptions, type YouTrackObject, type YouTrackValue } from "./client.js";

/** Native license material may also be echoed in sibling fields or embedded JSON. */
function settingsResult(value: YouTrackObject, token: string): YouTrackObject {
  const licenses: string[] = [];
  function visit(item: YouTrackValue): void {
    if (Array.isArray(item)) item.forEach(visit);
    else if (item !== null && typeof item === "object") for (const [key, child] of Object.entries(item)) {
      if (key === "license" && typeof child === "string") licenses.push(child);
      visit(child);
    }
  }
  visit(value);
  // scrub preserves JSON container kinds; only credential-bearing strings/keys change.
  return scrub(value, token.trim(), licenses) as YouTrackObject;
}

export async function getApiSchema(connection: Connection) {
  return settingsResult(await readObject(connection, "api/openapi.json", {}), connection.token);
}
export const getTelemetry = readObjectAt("api/admin/telemetry", "id,uptime,startedTime,availableProcessors,availableMemory,usedMemory,issuesCount,articlesCount");
export async function getGlobalSettings(connection: Connection, options: ProjectionOptions = {}) {
  return settingsResult(await readObject(connection, "api/admin/globalSettings", { fields: fields(options, "id") }), connection.token);
}
