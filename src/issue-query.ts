import {
  deleteObject,
  encodedID,
  fields,
  mutate,
  mutationBody,
  nullableText,
  page,
  readCollection,
  readCollectionAt,
  readObject,
  readObjectAt,
  requiredText,
  type Connection,
  type PageOptions,
  type ProjectionOptions,
  type YouTrackObject,
} from "./client.js";

export interface AssistOptions extends ProjectionOptions {
  query: string;
  caret?: number;
}

export interface CommandAssistOptions extends AssistOptions {
  issues?: readonly string[];
}

const suggestions = "suggestions(option,description,caret,completionStart,completionEnd)";
const savedQueryFields = "id,name,query,owner(id,login)";

function selectedIssues(ids: readonly string[]): YouTrackObject[] {
  return ids.map((id) => {
    requiredText(id, "issue ID");
    if (/^\d+-\d+$/.test(id)) {
      return { id };
    }
    if (/^[^\s,]+-\d+$/.test(id)) {
      return { idReadable: id };
    }
    return { id };
  });
}

export function parseIssueSelection(value: string): string[] {
  const ids = value.split(",");
  selectedIssues(ids);
  return ids;
}

function queryBody(options: AssistOptions): YouTrackObject {
  const query = requiredText(options.query, "query");
  if (
    options.caret !== undefined &&
    (
      !Number.isSafeInteger(options.caret) ||
      options.caret < -2_147_483_648 ||
      options.caret > 2_147_483_647
    )
  ) {
    throw new Error("The caret must be a signed 32-bit integer.");
  }
  return {
    query,
    ...(options.caret === undefined ? {} : { caret: options.caret }),
  };
}

function suggestionsResult(
  value: YouTrackObject,
  options: ProjectionOptions,
): YouTrackObject {
  if (
    (options.fields === undefined || Object.hasOwn(value, "suggestions")) &&
    (
      !Array.isArray(value.suggestions) ||
      value.suggestions.some((item) =>
        item === null || typeof item !== "object" || Array.isArray(item)
      )
    )
  ) {
    throw new Error("Invalid suggestions from YouTrack.");
  }
  return value;
}

export interface CommandApplyOptions extends ProjectionOptions {
  muteUpdateNotifications?: boolean;
  comment?: string | null;
  visibility?: YouTrackObject;
  caret?: number;
  silent?: boolean;
  runAs?: string | null;
}
export async function applyCommands(
  connection: Connection, query: string, issues: readonly string[], options: CommandApplyOptions = {},
): Promise<YouTrackObject | null> {
  if (options.silent !== undefined && typeof options.silent !== "boolean") throw new Error("The silent control must be boolean.");
  return mutate(connection, "api/commands", {
    ...queryBody({ ...options, query }), issues: selectedIssues(issues),
    ...(options.comment === undefined ? {} : { comment: nullableText(options.comment, "comment") }),
    ...(options.visibility === undefined ? {} : { visibility: mutationBody(options.visibility) }),
    ...(options.silent === undefined ? {} : { silent: options.silent }),
    ...(options.runAs === undefined ? {} : { runAs: nullableText(options.runAs, "runAs") }),
  }, fields(options, "query,issues(id,idReadable)"), options);
}

export async function assistCommands(
  connection: Connection,
  options: CommandAssistOptions,
): Promise<YouTrackObject> {
  return suggestionsResult(
    await readObject(
      connection,
      "api/commands/assist",
      {
        fields: fields(options, `query,caret,commands(description,error,delete),${suggestions}`),
      },
      {
        ...queryBody(options),
        ...(options.issues === undefined ? {} : { issues: selectedIssues(options.issues) }),
      },
    ),
    options,
  );
}

export async function assistSearch(
  connection: Connection,
  options: AssistOptions,
): Promise<YouTrackObject> {
  return suggestionsResult(
    await readObject(
      connection,
      "api/search/assist",
      { fields: fields(options, `query,caret,${suggestions}`) },
      queryBody(options),
    ),
    options,
  );
}

export async function countIssues(
  connection: Connection,
  query: string,
  options: ProjectionOptions = {},
): Promise<YouTrackObject> {
  const value = await readObject(
    connection,
    "api/issuesGetter/count",
    { fields: fields(options, "count") },
    { query: requiredText(query, "query") },
  );
  if (
    (options.fields === undefined || Object.hasOwn(value, "count")) &&
    value.count !== null &&
    (
      typeof value.count !== "number" ||
      !Number.isSafeInteger(value.count) ||
      value.count < -1
    )
  ) {
    throw new Error("Invalid issue count from YouTrack.");
  }
  return value;
}

export const listSavedQueries = readCollectionAt("api/savedQueries", savedQueryFields);
export const getSavedQuery = readObjectAt(
  (queryID: string) => `api/savedQueries/${encodedID(queryID, "saved query ID")}`,
  savedQueryFields,
);


function savedQueryBody(input: unknown, creating: boolean): YouTrackObject {
  const body = mutationBody(input);
  return { ...body,
    ...(creating || Object.hasOwn(body, "name") ? { name: requiredText(body.name as string, "name") } : {}),
    ...(creating || Object.hasOwn(body, "query") ? { query: nullableText(body.query, "query") } : {}),
  };
}
export async function createSavedQuery(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, "api/savedQueries", savedQueryBody(input, true), fields(options, savedQueryFields));
}
export async function updateSavedQuery(connection: Connection, queryID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, `api/savedQueries/${encodedID(queryID, "saved query ID")}`, savedQueryBody(input, false), fields(options, savedQueryFields));
}


export async function deleteSavedQuery(connection: Connection, queryID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `api/savedQueries/${encodedID(queryID, "saved query ID")}`, options);
}
