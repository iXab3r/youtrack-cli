import {
  encodedID,
  fields,
  issuePath,
  mutate,
  mutationBody,
  nullableText,
  page,
  readCollection,
  readCollectionAt,
  readObject,
  readPage,
  readObjectAt,
  requiredText,
  type Connection,
  type PageOptions,
  type YouTrackPage,
  type ProjectionOptions,
  type YouTrackObject,
  type WriteOptions,
} from "./client.js";

export interface ActivityOptions extends ProjectionOptions {
  categories: string;
  cursor?: string;
  reverse?: boolean;
  author?: string;
  activityStart?: string;
  activityEnd?: string;
  activityId?: string;
}

const activityFields =
  "id,beforeCursor,afterCursor,hasBefore,hasAfter,reverse,activities(id,$type,timestamp,author(id,login),category(id))";
const commentFields = "id,text,author(id,login),created,updated";
const vcsFields = "id,$type,date,fetched,text,author(login)";

export function activityCategories(value: string): string {
  return requiredText(value, "categories");
}

function activityQuery(options: ActivityOptions): Record<string, string> {
  if (options.reverse !== undefined && typeof options.reverse !== "boolean") {
    throw new Error("--reverse must be boolean.");
  }
  return {
    fields: fields(options, activityFields),
    categories: activityCategories(options.categories),
    ...(options.author === undefined ? {} : { author: requiredText(options.author, "author") }),
    ...(options.activityStart === undefined ? {} : { start: requiredText(options.activityStart, "activity start") }),
    ...(options.activityEnd === undefined ? {} : { end: requiredText(options.activityEnd, "activity end") }),
    ...(options.activityId === undefined ? {} : { activityId: requiredText(options.activityId, "activity ID") }),
    ...(options.cursor === undefined ? {} : { cursor: requiredText(options.cursor, "cursor") }),
    ...(options.reverse === undefined ? {} : { reverse: String(options.reverse) }),
  };
}

async function activityPage(
  connection: Connection,
  path: string,
  options: ActivityOptions,
): Promise<YouTrackObject> {
  const result = await readObject(connection, path, activityQuery(options));
  if (
    options.fields === undefined &&
    ["activities", "beforeCursor", "afterCursor", "hasBefore", "hasAfter", "reverse"]
      .some((key) => !Object.hasOwn(result, key))
  ) {
    throw new Error("Invalid activity page from YouTrack.");
  }
  if (
    result.activities !== undefined &&
    (!Array.isArray(result.activities) || result.activities.some(
      (item) => item === null || typeof item !== "object" || Array.isArray(item),
    ))
  ) {
    throw new Error("Invalid activity page from YouTrack.");
  }
  for (const key of ["beforeCursor", "afterCursor"]) {
    if (result[key] !== undefined && typeof result[key] !== "string") {
      throw new Error("Invalid activity page from YouTrack.");
    }
  }
  for (const key of ["hasBefore", "hasAfter", "reverse"]) {
    if (result[key] !== undefined && typeof result[key] !== "boolean") {
      throw new Error("Invalid activity page from YouTrack.");
    }
  }
  return result;
}

export async function getActivitiesPage(
  connection: Connection,
  options: ActivityOptions,
): Promise<YouTrackObject> {
  return activityPage(connection, "api/activitiesPage", options);
}

export async function getIssueActivitiesPage(
  connection: Connection,
  issueID: string,
  options: ActivityOptions,
): Promise<YouTrackObject> {
  return activityPage(connection, `${issuePath(issueID)}/activitiesPage`, options);
}

export const getComment = readObjectAt(
  (issueID: string, commentID: string) =>
    `${issuePath(issueID)}/comments/${encodedID(commentID, "comment ID")}`,
  commentFields,
);

export async function updateComment(
  connection: Connection,
  issueID: string,
  commentID: string,
  input: unknown,
  options: WriteOptions = {},
): Promise<YouTrackObject | null> {
  const body = mutationBody(input);
  return mutate(
    connection,
    `${issuePath(issueID)}/comments/${encodedID(commentID, "comment ID")}`,
    { ...body, ...(Object.hasOwn(body, "text") ? { text: nullableText(body.text, "text") } : {}) },
    commentFields,
    options,
  );
}

export const listIssueSprints = readCollectionAt(
  (issueID: string) => `${issuePath(issueID)}/sprints`,
  "id,name,goal,start,finish,archived,agile(id,name)",
);
export const listVcsChanges = readCollectionAt(
  (issueID: string) => `${issuePath(issueID)}/vcsChanges`,
  vcsFields,
);
export const getVcsChange = readObjectAt(
  (issueID: string, changeID: string) =>
    `${issuePath(issueID)}/vcsChanges/${encodedID(changeID, "change ID")}`,
  vcsFields,
);

/** Offset history is separate from the native cursor-page resource. */
export async function listIssueActivities(
  connection: Connection,
  issueID: string,
  options: ActivityOptions & PageOptions,
): Promise<YouTrackPage> {
  return readPage(connection, `${issuePath(issueID)}/activities`, {
    ...page(options, "id,$type,timestamp,author(id,login),category(id)"),
    ...activityQuery({ ...options, fields: fields(options, "id,$type,timestamp,author(id,login),category(id)") }),
  });
}

export const getIssueActivity = readObjectAt(
  (issueID: string, activityID: string) => `${issuePath(issueID)}/activities/${encodedID(activityID, "activity ID")}`,
  "id,$type,timestamp,author(id,login),category(id)",
);


export const getIssueProject = readObjectAt((issueID: string) => `${issuePath(issueID)}/project`, "id,name,shortName");
export async function setIssueProject(connection: Connection, issueID: string, input: unknown, options: WriteOptions = {}) {
  const body = mutationBody(input);
  return mutate(connection, `${issuePath(issueID)}/project`, { ...body, id: requiredText(body.id as string, "project ID") }, "id,name,shortName", options);
}
