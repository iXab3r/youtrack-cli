import { deleteStoredAlias } from "./credential-alias.js";
import { CliError, Permission, command, recordView } from "@eyeauras/cli-factory";
import { bodyOptions, projectionOptions, writeOptions, updateCommand, projectedBodyUpdate, projectedRead, readCommand } from "./cli-support.js";
import { getLicense, updateLicense, updateGlobalSettings, getAppearanceSettings, updateAppearanceSettings, getNotificationSettings, updateNotificationSettings, getLocaleSettings, updateLocaleSettings, getRestSettings, updateRestSettings, getSystemSettings, updateSystemSettings, getApiSchema, getTelemetry, getGlobalSettings } from "./server-settings.js";
import { licenseRecord, appearanceSettingsRecord, notificationSettingsRecord, localeSettingsRecord, telemetryRecord, globalSettingsRecord, systemSettingsRecord, corsSettingsRecord, mutationWritten, apiSchemaRecord, withView } from "./presentation.js";

import { mutationBody, scrubText } from "./client.js";

const licenseKey = (alias: string) => {
  if (!alias) throw new Error("The license alias must contain text.");
  return `server-license:${alias}`;
};
function cliLicenseBody(input: unknown) {
  const body = mutationBody(input);
  if (typeof body.license === "string") throw new Error("Use --license-secret for license material.");
  return body;
}
function cliGlobalBody(input: unknown) {
  const body = mutationBody(input);
  if (body.license !== undefined && body.license !== null) cliLicenseBody(body.license);
  return body;
}

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
    command("license", "Inspect and manage the server license", [
      command("delete <alias>", "Delete a stored server license", ({ args }, context) =>
        deleteStoredAlias(context, licenseKey(args.alias), args.alias), {
        permission: Permission.Update,
        view: recordView<{ alias: string }>({ title: result => `Deleted server license ${result.alias}`, fields: [] }),
      }),
      command("import <alias>", "Import a server license from environment", async ({ args }, context) => {
        const key = licenseKey(args.alias);
        const license = context.environment.YOUTRACK_LICENSE;
        if (license === undefined || license.length === 0) throw new Error("Set YOUTRACK_LICENSE to the server license.");
        const token = await context.secrets.get("token") ?? "";
        context.signal.throwIfAborted();
        await context.secrets.set(key, license);
        return { alias: scrubText(args.alias, token, [license]), stored: true };
      }, {
        permission: Permission.Update,
        options: [{ flags: "--from-env", description: "Read YOUTRACK_LICENSE", required: true }],
        view: recordView<{ alias: string }>({ title: result => `Stored server license ${result.alias}`, fields: [] }),
      }),
      projectedRead("get", "Show server license metadata", getLicense, licenseRecord),
      withView(mutationWritten("Updated server license"), updateCommand("update", "Update the server license", async (connection, input, context) => {
        const alias = input.options.licenseSecret;
        if (alias === undefined && input.options.body === undefined) throw new Error("Provide --license-secret or --body.");
        const body = cliLicenseBody(input.options.body ?? {});
        if (typeof alias !== "string") return updateLicense(connection, body, writeOptions(input.options));
        if (Object.hasOwn(body, "license")) throw new Error("Give license through --license-secret or --body, not both.");
        const license = await context.secrets.get(licenseKey(alias));
        if (license === undefined || license.length === 0) throw new CliError("The server license is not stored in this profile.", {
          code: "server.license.missing", next: [["server-settings", "license", "import", alias, "--from-env"]],
        });
        return updateLicense(connection, { ...body, license }, writeOptions(input.options));
      }, [...bodyOptions.map(option => ({ ...option, required: false })), ...projectionOptions, { flags: "--license-secret <alias>", description: "Stored server license alias" }])),
    ]),
    projectedBodyUpdate("update", "Update global settings", (connection, input, options) => updateGlobalSettings(connection, cliGlobalBody(input), options), undefined, mutationWritten("Updated global settings")),
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
