import { encodedID, fields, mutate, mutationBody, narrative, nativeInt32, nullableText, readCollectionAt, readObjectAt, type Connection, type ProjectionOptions } from "./client.js";

const root = "api/admin/databaseBackup";
const fileFields = "id,name,size,creationDate";
const settingsFields = "id,isOn,archiveFormat,filesToKeep,cronExpression,location,availableDiskSpace";
export const listBackupFiles = readCollectionAt(`${root}/backups`, fileFields);
export const getBackupFile = readObjectAt((backup: string) => `${root}/backups/${encodedID(backup, "backup ID")}`, fileFields);
export const getBackupSettings = readObjectAt(`${root}/settings`, settingsFields);
export const getBackupStatus = readObjectAt(`${root}/settings/backupStatus`, "id,backupInProgress,backupCancelled,backupError(date,errorMessage)");
export async function updateBackupSettings(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  if (Object.hasOwn(body, "location")) nullableText(body.location, "location");
  if (Object.hasOwn(body, "cronExpression")) narrative(body.cronExpression, "cronExpression");
  if (Object.hasOwn(body, "filesToKeep") && !nativeInt32(body.filesToKeep)) throw new Error("The filesToKeep value must be an Int32 number.");
  if (Object.hasOwn(body, "archiveFormat") && (typeof body.archiveFormat !== "string" || !["TAR_GZ", "ZIP"].includes(body.archiveFormat))) throw new Error("The archiveFormat value must be TAR_GZ or ZIP.");
  if (Object.hasOwn(body, "isOn") && typeof body.isOn !== "boolean") throw new Error("The isOn flag must be boolean.");
  if (Object.hasOwn(body, "notifiedUsers")) {
    if (!Array.isArray(body.notifiedUsers)) throw new Error("The notifiedUsers value must be an array of users.");
    body.notifiedUsers.forEach(user => mutationBody(user));
  }
  if (Object.hasOwn(body, "backupStatus")) mutationBody(body.backupStatus);
  return mutate(connection, `${root}/settings`, body, fields(options, settingsFields));
}
