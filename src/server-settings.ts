import { mutate, mutationBody, nativeInt32, nullableText, fields, readObject, readObjectAt, scrub, type Connection, type ProjectionOptions, type YouTrackObject, type YouTrackValue } from "./client.js";

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


const systemFields = "id,baseUrl,maxUploadFileSize,maxExportItems,administratorEmail,allowStatisticsCollection,isApplicationReadOnly";
const corsFields = "id,allowedOrigins,allowAllOrigins";
export const getSystemSettings = readObjectAt("api/admin/globalSettings/systemSettings", systemFields);
export const getRestSettings = readObjectAt("api/admin/globalSettings/restSettings", corsFields);
export async function updateSystemSettings(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  for (const key of ["baseUrl", "administratorEmail"]) if (Object.hasOwn(body, key)) nullableText(body[key], key);
  for (const key of ["allowStatisticsCollection", "isApplicationReadOnly"]) if (Object.hasOwn(body, key) && typeof body[key] !== "boolean") throw new Error(`The ${key} flag must be boolean.`);
  if (Object.hasOwn(body, "maxExportItems") && !nativeInt32(body.maxExportItems)) throw new Error("The maxExportItems value must be an Int32 number.");
  if (Object.hasOwn(body, "maxUploadFileSize") && (typeof body.maxUploadFileSize !== "number" || !Number.isInteger(body.maxUploadFileSize) || body.maxUploadFileSize < -(2 ** 63) || body.maxUploadFileSize >= 2 ** 63)) throw new Error("The maxUploadFileSize value must be a representable Int64 number.");
  return mutate(connection, "api/admin/globalSettings/systemSettings", body, fields(options, systemFields));
}
export async function updateRestSettings(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  if (Object.hasOwn(body, "allowAllOrigins") && typeof body.allowAllOrigins !== "boolean") throw new Error("The allowAllOrigins flag must be boolean.");
  if (Object.hasOwn(body, "allowedOrigins") && (!Array.isArray(body.allowedOrigins) || body.allowedOrigins.some(value => typeof value !== "string"))) throw new Error("The allowedOrigins value must be an array of strings.");
  return mutate(connection, "api/admin/globalSettings/restSettings", body, fields(options, corsFields));
}
