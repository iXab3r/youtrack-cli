import { command } from "@eyeauras/cli-factory";
import { projectedRead, readCommand } from "./cli-support.js";
import { getApiSchema, getTelemetry, getGlobalSettings } from "./server-settings.js";
import { apiSchemaRecord, withView } from "./presentation.js";

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
    projectedRead("get", "Show global settings", getGlobalSettings),
  ]),
];
