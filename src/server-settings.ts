import { mutate, mutationBody, nativeInt32, nullableText, fields, readObject, readObjectAt, type Connection, type ProjectionOptions } from "./client.js";

export async function getApiSchema(connection: Connection) {
  return readObject(connection, "api/openapi.json", {});
}
export const getTelemetry = readObjectAt("api/admin/telemetry", "id,uptime,startedTime,availableProcessors,availableMemory,usedMemory,issuesCount,articlesCount");
export const getGlobalSettings = readObjectAt("api/admin/globalSettings", "id");


const systemFields = "id,baseUrl,maxUploadFileSize,maxExportItems,administratorEmail,allowStatisticsCollection,isApplicationReadOnly";
const corsFields = "id,allowedOrigins,allowAllOrigins";
export const getSystemSettings = readObjectAt("api/admin/globalSettings/systemSettings", systemFields);
export const getRestSettings = readObjectAt("api/admin/globalSettings/restSettings", corsFields);
export async function updateSystemSettings(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  for (const key of ["baseUrl", "administratorEmail"]) {
    if (Object.hasOwn(body, key)) nullableText(body[key], key);
  }
  for (const key of ["allowStatisticsCollection", "isApplicationReadOnly"]) {
    if (Object.hasOwn(body, key) && typeof body[key] !== "boolean") throw new Error(`The ${key} flag must be boolean.`);
  }
  if (Object.hasOwn(body, "maxExportItems") && !nativeInt32(body.maxExportItems)) {
    throw new Error("The maxExportItems value must be an Int32 number.");
  }
  if (Object.hasOwn(body, "maxUploadFileSize") && (
    typeof body.maxUploadFileSize !== "number" || !Number.isInteger(body.maxUploadFileSize) ||
    body.maxUploadFileSize < -(2 ** 63) || body.maxUploadFileSize >= 2 ** 63
  )) throw new Error("The maxUploadFileSize value must be a representable Int64 number.");
  return mutate(connection, "api/admin/globalSettings/systemSettings", body, fields(options, systemFields));
}
export async function updateRestSettings(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  if (Object.hasOwn(body, "allowAllOrigins") && typeof body.allowAllOrigins !== "boolean") throw new Error("The allowAllOrigins flag must be boolean.");
  if (Object.hasOwn(body, "allowedOrigins") && (
    !Array.isArray(body.allowedOrigins) || body.allowedOrigins.some(value => typeof value !== "string")
  )) throw new Error("The allowedOrigins value must be an array of strings.");
  return mutate(connection, "api/admin/globalSettings/restSettings", body, fields(options, corsFields));
}
