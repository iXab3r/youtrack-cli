import {
  fields, mutate, deleteObject, mutationBody, narrative, requiredText, type ProjectionOptions,
  encodedID,
  page,
  readPage,
  readCollectionAt,
  readObjectAt,
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

export const listGroups = readCollectionAt("api/groups", groupFields);
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
