import { command } from "@eyeauras/cli-factory";
import { projectedBodyUpdate, projectedRead, readCommand } from "./cli-support.js";
import { getAppearanceSettings, updateAppearanceSettings, getNotificationSettings, updateNotificationSettings, getLocaleSettings, updateLocaleSettings, getRestSettings, updateRestSettings, getSystemSettings, updateSystemSettings, getApiSchema, getTelemetry, getGlobalSettings } from "./server-settings.js";
import { appearanceSettingsRecord, notificationSettingsRecord, localeSettingsRecord, telemetryRecord, globalSettingsRecord, systemSettingsRecord, corsSettingsRecord, mutationWritten, apiSchemaRecord, withView } from "./presentation.js";

export const serverSettingsRootCommands = [
  command("api-schema", "Inspect the REST API schema", [
    withView(apiSchemaRecord, readCommand("get", "Show the REST API schema", connection => getApiSchema(connection))),
  ]),
  command("server", "Inspect installation status", [
    command("telemetry", "Inspect server telemetry", [
      projectedRead("get", "Show server telemetry", getTelemetry, telemetryRecord),
    ]),
  ]),
  command("server-settings", "Inspect and manage installation settings", [
    command("appearance-settings", "Inspect and manage appearance settings", [
      projectedRead("get", "Show appearance settings", getAppearanceSettings, appearanceSettingsRecord),
      projectedBodyUpdate("update", "Update appearance settings", updateAppearanceSettings, undefined, mutationWritten("Updated appearance settings")),
    ]),
    command("notification-settings", "Inspect and manage email settings", [
      projectedRead("get", "Show email settings", getNotificationSettings, notificationSettingsRecord),
      projectedBodyUpdate("update", "Update email settings", updateNotificationSettings, undefined, mutationWritten("Updated email settings")),
    ]),
    command("locale-settings", "Inspect and manage locale settings", [
      projectedRead("get", "Show locale settings", getLocaleSettings, localeSettingsRecord),
      projectedBodyUpdate("update", "Update locale settings", updateLocaleSettings, undefined, mutationWritten("Updated locale settings")),
    ]),
    command("rest-settings", "Inspect and manage CORS settings", [
      projectedRead("get", "Show CORS settings", getRestSettings, corsSettingsRecord),
      projectedBodyUpdate("update", "Update CORS settings", updateRestSettings, undefined, mutationWritten("Updated CORS settings")),
    ]),
    command("system-settings", "Inspect and manage system settings", [
      projectedRead("get", "Show system settings", getSystemSettings, systemSettingsRecord),
      projectedBodyUpdate("update", "Update system settings", updateSystemSettings, undefined, mutationWritten("Updated system settings")),
    ]),
    projectedRead("get", "Show global settings", getGlobalSettings, globalSettingsRecord),
  ]),
];
