import {
  namedMutationBody,
  fields, mutate, deleteObject, mutationBody, narrative, requiredText, type ProjectionOptions,
  encodedID,
  page,
  readPage,
  readCollectionAt,
  readObjectAt,
  type IssueSearchOptions,
  type Connection,
  type PageOptions,
  type YouTrackPage,
} from "./client.js";

export interface MemberOptions extends PageOptions {
  direct?: boolean;
}

const groupFields = "id,name,usersCount";
const userFields = "id,login,fullName";

function groupPath(groupID: string): string {
  return `api/groups/${encodedID(groupID, "group ID")}`;
}

function teamPath(projectID: string): string {
  return `api/admin/projects/${encodedID(projectID, "project ID")}/team`;
}

export async function listGroups(connection: Connection, options: IssueSearchOptions = {}) {
  return readPage(connection, "api/groups", {
    ...page(options, groupFields),
    ...(options.query === undefined ? {} : { query: requiredText(options.query, "query") }),
  });
}
export const getGroup = readObjectAt(groupPath, groupFields);

export async function listGroupMembers(
  connection: Connection,
  groupID: string,
  options: MemberOptions = {},
): Promise<YouTrackPage> {
  const members = options.direct === true ? "ownUsers" : "users";
  return readPage(connection, `${groupPath(groupID)}/${members}`, page(options, userFields));
}

export const listSubgroups = readCollectionAt(
  (groupID: string) => `${groupPath(groupID)}/subGroups`,
  groupFields,
);
export const getProjectTeam = readObjectAt(teamPath, groupFields);
export const listProjectTeamGroups = readCollectionAt(
  (projectID: string) => `${teamPath(projectID)}/groups`,
  groupFields,
);

export async function listProjectTeamUsers(
  connection: Connection,
  projectID: string,
  options: MemberOptions = {},
): Promise<YouTrackPage> {
  const members = options.direct === true ? "ownUsers" : "users";
  return readPage(connection, `${teamPath(projectID)}/${members}`, page(options, userFields));
}


export async function addProjectTeamUser(connection: Connection, projectID: string, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  requiredText(narrative(body.id, "user ID"), "user ID");
  return mutate(connection, `${teamPath(projectID)}/ownUsers`, body, fields(options, userFields));
}
export async function removeProjectTeamUser(connection: Connection, projectID: string, userID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `${teamPath(projectID)}/ownUsers/${encodedID(userID, "user ID")}`, options);
}


export async function addProjectTeamGroup(connection: Connection, projectID: string, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  requiredText(narrative(body.id, "group ID"), "group ID");
  return mutate(connection, `${teamPath(projectID)}/groups`, body, fields(options, groupFields));
}
export async function removeProjectTeamGroup(connection: Connection, projectID: string, groupID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `${teamPath(projectID)}/groups/${encodedID(groupID, "group ID")}`, options);
}


export async function updateProjectTeam(connection: Connection, projectID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, teamPath(projectID), mutationBody(input), fields(options, groupFields));
}


export async function addGroupMember(connection: Connection, groupID: string, userID: string, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  if (Object.hasOwn(body, "id") && body.id !== userID) throw new Error("The body user ID must match the selected user.");
  return mutate(connection, `${groupPath(groupID)}/ownUsers/${encodedID(userID, "user ID")}`, body, fields(options, userFields));
}


export async function createGroup(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, "api/groups", namedMutationBody(input, true), fields(options, groupFields));
}
export async function updateGroup(connection: Connection, groupID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, groupPath(groupID), namedMutationBody(input, false), fields(options, groupFields));
}
export async function deleteGroup(connection: Connection, groupID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, groupPath(groupID), options);
}
