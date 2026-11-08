import { command } from "@eyeauras/cli-factory";
import { pagedRead, projectedRead, projectedBodyUpdate, projectedDelete } from "./cli-support.js";
import { createRoleAssignment, deleteRoleAssignment, listRoleAssignments, getRoleAssignment, listPermissions, listRoles, getRole } from "./access-catalog.js";
import { mutationWritten, namedTable, roleRecord, roleAssignmentRecord, roleAssignmentTable } from "./presentation.js";

const queryOptions = [{ flags: "--query <query>", description: "Filter with a YouTrack access query" }];

export const accessCatalogRootCommands = [
  command("role-assignment", "Manage role assignments", [
    projectedBodyUpdate("create", "Assign a role in the selected scope", createRoleAssignment, undefined, roleAssignmentRecord),
    projectedDelete("delete <assignment>", "Revoke a role assignment", deleteRoleAssignment, mutationWritten("Revoked role assignment", "assignment")),
    pagedRead("list", "List role assignments", listRoleAssignments, roleAssignmentTable, queryOptions),
    projectedRead("get <assignment>", "Show a role assignment", getRoleAssignment, roleAssignmentRecord),
  ]),
  command("permission-catalog", "Inspect service permissions", [
    pagedRead("list", "List YouTrack permissions", listPermissions, namedTable("PERMISSION", "No permissions.")),
  ]),
  command("role", "Inspect service roles", [
    pagedRead("list", "List YouTrack roles", listRoles, namedTable("ROLE", "No roles."), queryOptions),
    projectedRead("get <role>", "Show a role", getRole, roleRecord),
  ]),
];
