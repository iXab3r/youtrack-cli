import { command } from "@eyeauras/cli-factory";
import { projectedBodyUpdate, projectedRead, readCommand } from "./cli-support.js";
import { getRestSettings, updateRestSettings, getSystemSettings, updateSystemSettings, getApiSchema, getTelemetry, getGlobalSettings } from "./server-settings.js";
import { mutationWritten, apiSchemaRecord, withView } from "./presentation.js";

export const serverSettingsRootCommands = [
  command("api-schema", "Inspect the REST API schema", [
    withView(apiSchemaRecord, readCommand("get", "Show the REST API schema", connection => getApiSchema(connection))),
  ]),
  command("server", "Inspect installation status", [
    command("telemetry", "Inspect server telemetry", [
      projectedRead("get", "Show server telemetry", getTelemetry),
    ]),
  ]),
  command("server-settings", "Inspect and manage installation settings", [
    command("rest-settings", "Inspect and manage CORS settings", [
      projectedRead("get", "Show CORS settings", getRestSettings),
      projectedBodyUpdate("update", "Update CORS settings", updateRestSettings, undefined, mutationWritten("Updated CORS settings")),
    ]),
    command("system-settings", "Inspect and manage system settings", [
      projectedRead("get", "Show system settings", getSystemSettings),
      projectedBodyUpdate("update", "Update system settings", updateSystemSettings, undefined, mutationWritten("Updated system settings")),
    ]),
    projectedRead("get", "Show global settings", getGlobalSettings),
  ]),
];
