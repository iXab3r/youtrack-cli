import { mutate, mutationBody, narrative, requiredText, nativeInt32, nullableText, fields, readObject, readObjectAt, type Connection, type ProjectionOptions } from "./client.js";

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

const appearanceFields = "id,timeZone(id,presentation),dateFieldFormat(id,presentation,pattern,datePattern)";
const notificationFields = "id,emailSettings(id,isEnabled,host,port,mailProtocol,anonymous,from,replyTo)";
const localeFields = "id,isRTL,locale(id,name,locale,language,community)";
export const getAppearanceSettings = readObjectAt("api/admin/globalSettings/appearanceSettings", appearanceFields);
export const getNotificationSettings = readObjectAt("api/admin/globalSettings/notificationSettings", notificationFields);
export const getLocaleSettings = readObjectAt("api/admin/globalSettings/localeSettings", localeFields);
export async function updateAppearanceSettings(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  for (const key of ["timeZone", "dateFieldFormat"]) if (Object.hasOwn(body, key)) mutationBody(body[key]);
  return mutate(connection, "api/admin/globalSettings/appearanceSettings", body, fields(options, appearanceFields));
}
export async function updateNotificationSettings(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  if (Object.hasOwn(body, "emailSettings")) {
    const email = mutationBody(body.emailSettings);
    for (const key of ["host", "login", "replyTo"]) if (Object.hasOwn(email, key)) nullableText(email[key], key);
    if (Object.hasOwn(email, "from")) narrative(email.from, "from");
    for (const key of ["isEnabled", "anonymous"]) if (Object.hasOwn(email, key) && typeof email[key] !== "boolean") throw new Error(`The ${key} flag must be boolean.`);
    if (Object.hasOwn(email, "port") && !nativeInt32(email.port)) throw new Error("The port value must be an Int32 number.");
    if (Object.hasOwn(email, "mailProtocol") && (typeof email.mailProtocol !== "string" || !["SMTP", "SMTPS", "SMTP_TLS", "MS_GRAPH_API"].includes(email.mailProtocol))) {
      throw new Error("The mailProtocol value must be SMTP, SMTPS, SMTP_TLS or MS_GRAPH_API.");
    }
    if (Object.hasOwn(email, "sslKey") && email.sslKey !== null) mutationBody(email.sslKey);
  }
  return mutate(connection, "api/admin/globalSettings/notificationSettings", body, fields(options, notificationFields));
}
export async function updateLocaleSettings(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  requiredText(narrative(mutationBody(body.locale).id, "locale ID"), "locale ID");
  if (Object.hasOwn(body, "isRTL") && typeof body.isRTL !== "boolean") throw new Error("The isRTL flag must be boolean.");
  return mutate(connection, "api/admin/globalSettings/localeSettings", body, fields(options, localeFields));
}
