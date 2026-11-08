import {
  customFieldQuery, issueListFields,
  deleteObject,
  encodedID,
  issuePath,
  mutate,
  mutationBody,
  namedMutationBody,
  narrative,
  fields,
  page,
  readPage,
  requiredText,
  readCollectionAt,
  readObjectAt,
  type Connection,
  type YouTrackObject,
  type IssueSearchOptions,
  type WriteOptions,
  type PageOptions,
  type ProjectionOptions,
} from "./client.js";

const linkTypeFields = "id,name,directed,sourceToTarget,targetToSource";
const linkFields = `id,direction,linkType(${linkTypeFields})`;
const linkedIssueFields = "id,idReadable,summary";
const tagFields = "id,name";

function linkPath(issueID: string, linkID: string): string {
  return `${issuePath(issueID)}/links/${encodedID(linkID, "link ID")}`;
}

function targetBody(input: unknown): YouTrackObject {
  const body = mutationBody(input);
  const id = narrative(body.id, "target id");
  encodedID(id, "target ID");
  return { ...body, id };
}

export const listLinkTypes = readCollectionAt("api/issueLinkTypes", linkTypeFields);
export const getLinkType = readObjectAt(
  (typeID: string) => `api/issueLinkTypes/${encodedID(typeID, "link type ID")}`,
  linkTypeFields,
);
export const listIssueLinks = readCollectionAt(
  (issueID: string) => `${issuePath(issueID)}/links`,
  linkFields,
);
export const getIssueLink = readObjectAt(linkPath, linkFields);
export const listLinkedIssues = readCollectionAt(
  (issueID: string, linkID: string) => `${linkPath(issueID, linkID)}/issues`,
  linkedIssueFields,
);

export async function addIssueLink(
  connection: Connection,
  issueID: string,
  linkID: string,
  input: unknown,
  options: WriteOptions = {},
): Promise<YouTrackObject | null> {
  return mutate(connection, `${linkPath(issueID, linkID)}/issues`, targetBody(input), linkedIssueFields, options);
}

export async function removeIssueLink(
  connection: Connection,
  issueID: string,
  linkID: string,
  targetIssueID: string,
  options: ProjectionOptions = {},
): Promise<YouTrackObject | null> {
  return deleteObject(
    connection,
    `${linkPath(issueID, linkID)}/issues/${encodedID(targetIssueID, "target issue ID")}`,
    options,
  );
}

export async function listTags(connection: Connection, options: IssueSearchOptions = {}) {
  return readPage(connection, "api/tags", {
    ...page(options, tagFields),
    ...(options.query === undefined ? {} : { query: requiredText(options.query, "query") }),
  });
}
export const getTag = readObjectAt(
  (tagID: string) => `api/tags/${encodedID(tagID, "tag ID")}`,
  tagFields,
);
export const getIssueTag = readObjectAt(
  (issueID: string, tagID: string) => `${issuePath(issueID)}/tags/${encodedID(tagID, "tag ID")}`,
  tagFields,
);
export const listIssueTags = readCollectionAt(
  (issueID: string) => `${issuePath(issueID)}/tags`,
  tagFields,
);

export async function addIssueTag(
  connection: Connection,
  issueID: string,
  input: unknown,
  options: WriteOptions = {},
): Promise<YouTrackObject | null> {
  return mutate(connection, `${issuePath(issueID)}/tags`, targetBody(input), fields(options, tagFields));
}

export async function removeIssueTag(
  connection: Connection,
  issueID: string,
  tagID: string,
  options: ProjectionOptions = {},
): Promise<YouTrackObject | null> {
  return deleteObject(connection, `${issuePath(issueID)}/tags/${encodedID(tagID, "tag ID")}`, options);
}

export async function createTag(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, "api/tags", namedMutationBody(input, true), fields(options, tagFields));
}
export async function updateTag(connection: Connection, tagID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, `api/tags/${encodedID(tagID, "tag ID")}`, namedMutationBody(input, false), fields(options, tagFields));
}


export interface TagIssueOptions extends PageOptions {
  customFields?: readonly string[];
}
export async function listTagIssues(connection: Connection, tagID: string, options: TagIssueOptions = {}) {
  return readPage(connection, `api/tags/${encodedID(tagID, "tag ID")}/issues`, {
    ...page(options, issueListFields), ...customFieldQuery(options.customFields),
  });
}
export async function deleteTag(connection: Connection, tagID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `api/tags/${encodedID(tagID, "tag ID")}`, options);
}


function linkTypeBody(input: unknown, creating: boolean) {
  const body = namedMutationBody(input, creating);
  for (const key of ["sourceToTarget", "targetToSource"]) if (creating || Object.hasOwn(body, key)) narrative(body[key], key);
  for (const key of ["directed", "aggregation", "readOnly"]) if (Object.hasOwn(body, key) && typeof body[key] !== "boolean") throw new Error(`The ${key} must be boolean.`);
  return body;
}
export async function createLinkType(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, "api/issueLinkTypes", linkTypeBody(input, true), fields(options, linkTypeFields));
}
export async function updateLinkType(connection: Connection, typeID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, `api/issueLinkTypes/${encodedID(typeID, "link type ID")}`, linkTypeBody(input, false), fields(options, linkTypeFields));
}
export async function deleteLinkType(connection: Connection, typeID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `api/issueLinkTypes/${encodedID(typeID, "link type ID")}`, options);
}
