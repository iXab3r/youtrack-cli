import { command, jsonParser, type OptionDefinition } from "@eyeauras/cli-factory";
import { requiredText, type YouTrackObject } from "./client.js";
import { pagedRead, projectedBodyUpdate, projectedRead, readCommand, updateCommand, projectionOptions, readOptions, writeOptions, notificationOptions } from "./cli-support.js";
import {
  applyCommands,
  createSavedQuery,
  updateSavedQuery,
  assistCommands,
  assistSearch,
  countIssues,
  getSavedQuery,
  listSavedQueries,
  parseIssueSelection,
  type AssistOptions,
} from "./issue-query.js";
import { commandApplied, countRecord, savedQueryTable, savedQueryRecord, withView } from "./presentation.js";

const queryOptions: readonly OptionDefinition[] = [
  ...projectionOptions,
  {
    flags: "--query <query>",
    description: "YouTrack query text",
    required: true,
    parse: (value) => requiredText(value, "query"),
  },
];

const issueOption: OptionDefinition = {
  flags: "--issues <ids>",
  description: "Comma-separated issue IDs",
  parse: parseIssueSelection,
};

const assistOptions: readonly OptionDefinition[] = [
  ...queryOptions,
  {
    flags: "--caret <position>",
    description: "Set the command caret position",
    parse: (value) => {
      if (!/^-?\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < -2_147_483_648 || Number(value) > 2_147_483_647) {
        throw new Error("The caret must be a signed 32-bit integer.");
      }
      return Number(value);
    },
  },
];

function assistInput(options: Record<string, unknown>): AssistOptions {
  return {
    ...readOptions(options),
    query: String(options.query),
    ...(typeof options.caret === "number" ? { caret: options.caret } : {}),
  };
}

export const queryRootCommands = [
  command("commands", "Apply issue commands or get suggestions", [
    withView(commandApplied, updateCommand(
      "apply",
      "Apply a command to the selected issues",
      async (connection, { options }, context) => applyCommands(
        connection,
        String(options.query),
        options.issues as string[],
        {
          ...writeOptions(options),
          ...(typeof options.comment === "string" ? { comment: options.comment } : {}),
          ...(options.visibility === undefined ? {} : { visibility: options.visibility as YouTrackObject }),
          ...(typeof options.caret === "number" ? { caret: options.caret } : {}),
          ...(typeof options.silent === "boolean" ? { silent: options.silent } : {}),
          ...(typeof options.runAs === "string" ? { runAs: options.runAs } : {}),
        },
      ),
      [...queryOptions, { ...issueOption, required: true }, ...notificationOptions,
        ...assistOptions.filter(option => option.flags.startsWith("--caret ")),
        { flags: "--comment <text>", description: "Add a comment with the command" },
        { flags: "--visibility <json>", description: "Set comment visibility", parse: jsonParser("The visibility must be valid JSON.") },
        { flags: "--run-as <login>", description: "Apply as a selected user" },
        { flags: "--silent [boolean]", description: "Apply silently (true or false)", parse(value) {
          if (value === "true") return true;
          if (value === "false") return false;
          throw new Error("The silent control must be true or false.");
        } },
      ],
    )),
    readCommand(
      "assist",
      "Suggest command completions",
      async (connection, { options }, context) => assistCommands(connection, {
        ...assistInput(options),
        ...(options.issues === undefined ? {} : { issues: options.issues as string[] }),
      }),
      [...assistOptions, issueOption],
    ),
  ]),
  command("search", "Inspect search suggestions", [
    readCommand(
      "assist",
      "Suggest search completions",
      async (connection, { options }, context) => assistSearch(connection, assistInput(options)),
      assistOptions,
    ),
  ]),
  command("saved-queries", "Read and maintain saved searches", [
    projectedBodyUpdate("create", "Create a saved search", createSavedQuery, undefined, savedQueryRecord),
    projectedBodyUpdate("update <queryID>", "Update a saved search", updateSavedQuery, undefined, savedQueryRecord),
    pagedRead("list", "List saved searches", listSavedQueries, savedQueryTable),
    projectedRead("get <queryID>", "Show a saved search", getSavedQuery),
  ]),
];

export const queryIssueChildren = [
  withView(countRecord, readCommand(
    "count",
    "Count the issues a query matches",
    async (connection, { options }, context) => countIssues(
      connection,
      String(options.query),
      readOptions(options),
    ),
    queryOptions,
  )),
];
