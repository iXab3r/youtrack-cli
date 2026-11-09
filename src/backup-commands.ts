import { command } from "@eyeauras/cli-factory";
import { pagedRead, projectedRead, projectedBodyUpdate } from "./cli-support.js";
import { listBackupFiles, getBackupFile, getBackupSettings, getBackupStatus, updateBackupSettings } from "./backup.js";
import { backupFileTable, backupFileRecord, backupSettingsRecord, backupStatusRecord, mutationWritten } from "./presentation.js";

export const backupCommand = command("backup", "Inspect and manage database backups", [
  command("file", "Inspect backup files", [
    pagedRead("list", "List backup files", listBackupFiles, backupFileTable),
    projectedRead("get <backup>", "Show backup file metadata", getBackupFile, backupFileRecord),
  ]),
  command("settings", "Inspect and manage backup settings", [
    projectedRead("get", "Show backup settings", getBackupSettings, backupSettingsRecord),
    projectedBodyUpdate("update", "Update backup settings", updateBackupSettings, undefined, mutationWritten("Updated backup settings")),
  ]),
  command("status", "Inspect backup status", [projectedRead("get", "Show backup status", getBackupStatus, backupStatusRecord)]),
]);
