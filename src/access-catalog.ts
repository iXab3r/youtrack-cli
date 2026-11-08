import {
  fields, mutate, deleteObject, mutationBody, namedMutationBody, narrative, type ProjectionOptions, encodedID, page, readPage, readCollectionAt, readObjectAt, requiredText,
  type Connection, type IssueSearchOptions,
} from "./client.js";

const assignmentFields = "id,role(id,name),holder(id,$type),scope(id,$type)";
const roleFields = "id,name,description,immutable,permissions(id,name)";
const permissionFields = "id,name,description,scope,operation,permissionEntityType";

export async function listRoleAssignments(connection: Connection, options: IssueSearchOptions = {}) {
  return readPage(connection, "api/assignedRoles", {
    ...page(options, assignmentFields),
    ...(options.query === undefined ? {} : { query: requiredText(options.query, "query") }),
  });
}
export const getRoleAssignment = readObjectAt(
  (assignmentID: string) => `api/assignedRoles/${encodedID(assignmentID, "role assignment ID")}`,
  assignmentFields,
);
export const listPermissions = readCollectionAt("api/permissions", permissionFields);
export async function listRoles(connection: Connection, options: IssueSearchOptions = {}) {
  return readPage(connection, "api/roles", {
    ...page(options, roleFields),
    ...(options.query === undefined ? {} : { query: requiredText(options.query, "query") }),
  });
}
export const getRole = readObjectAt(
  (roleID: string) => `api/roles/${encodedID(roleID, "role ID")}`, roleFields,
);


export async function createRoleAssignment(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  requiredText(narrative(mutationBody(body.role).id, "role ID"), "role ID");
  requiredText(narrative(mutationBody(body.holder).id, "holder ID"), "holder ID");
  const scope = mutationBody(body.scope);
  requiredText(narrative(scope.$type, "scope type"), "scope type");
  if (scope.$type === "ProjectScope") requiredText(narrative(mutationBody(scope.project).id, "project ID"), "project ID");
  if (scope.$type === "OrganizationScope") requiredText(narrative(mutationBody(scope.organization).id, "organization ID"), "organization ID");
  return mutate(connection, "api/assignedRoles", body, fields(options, assignmentFields));
}
export async function deleteRoleAssignment(connection: Connection, assignmentID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `api/assignedRoles/${encodedID(assignmentID, "role assignment ID")}`, options);
}


export async function createRole(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, "api/roles", namedMutationBody(input, false), fields(options, roleFields));
}
export async function updateRole(connection: Connection, roleID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, `api/roles/${encodedID(roleID, "role ID")}`, namedMutationBody(input, false), fields(options, roleFields));
}
export async function deleteRole(connection: Connection, roleID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `api/roles/${encodedID(roleID, "role ID")}`, options);
}
