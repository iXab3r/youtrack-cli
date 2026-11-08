import { command, type CommandDefinition } from "@eyeauras/cli-factory";
import { bodyOptions, projectionOptions, readOptions, updateCommand, projectedBodyUpdate, notificationOptions, pagedRead, projectedRead } from "./cli-support.js";
import {
  createProject, updateProject,
  getProject,
  createProjectField, updateProjectField,
  getProjectField,
  listProjectFields,
  listUsers,
  getIssueField,
  listIssueFields,
  setIssueField,
} from "./issue-fields.js";
import { rememberSubmittedIdentity, mutationWritten, withView, issueFieldRecord, issueFieldTable, projectFieldTable, projectFieldRecord, projectRecord, userTable } from "./presentation.js";

export const fieldsProjectChildren: readonly CommandDefinition[] = [
  withView(mutationWritten("Created project"), updateCommand("create", "Create a project with the selected leader", async (client, input) => {
    const { options } = input;
    const result = await createProject(client, options.body, { ...readOptions(options), ...(typeof options.template === "string" ? { template: options.template } : {}) });
    rememberSubmittedIdentity(input, client.token);
    return result;
  }, [...bodyOptions, ...projectionOptions, { flags: "--template <name>", description: "Use a project template" }])),
  projectedBodyUpdate("update <project>", "Update a selected project", updateProject, undefined, mutationWritten("Updated project", "project")),
  projectedRead("get <project>", "Show a project", getProject, projectRecord),
  command("field", "Inspect project custom-field settings", [
    projectedBodyUpdate("create <project>", "Attach a custom field", createProjectField, undefined, projectFieldRecord),
    projectedBodyUpdate("update <project> <field>", "Update project field settings", updateProjectField, undefined, projectFieldRecord),
    pagedRead("list <project>", "List the project's custom fields", listProjectFields, projectFieldTable),
    projectedRead("get <project> <field>", "Show a project custom field", getProjectField),
  ]),
];

export const fieldsUserChildren: readonly CommandDefinition[] = [
  pagedRead("list", "List users", listUsers, userTable),
];

export const fieldsIssueChildren: readonly CommandDefinition[] = [
  command("fields", "Read and set custom fields", [
    pagedRead("list <issueID>", "List the issue's custom fields", listIssueFields, issueFieldTable),
    projectedRead("get <issueID> <fieldID>", "Show a custom field", getIssueField, issueFieldRecord),
    projectedBodyUpdate(
      "set <issueID> <fieldID>",
      "Set a field value or state event",
      setIssueField,
      undefined,
      issueFieldRecord,
      notificationOptions,
    ),
  ]),
];
