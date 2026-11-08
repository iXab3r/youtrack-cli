import {
  encodedID, page, readPage, readCollectionAt, readObjectAt, requiredText,
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
