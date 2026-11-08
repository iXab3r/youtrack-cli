import { command } from "@eyeauras/cli-factory";
import { pagedRead, projectedRead, projectedBodyUpdate, projectedDelete } from "./cli-support.js";
import { listOrganizations, getOrganization, createOrganization, updateOrganization, deleteOrganization } from "./organizations.js";
import { namedTable, mutationWritten } from "./presentation.js";

export const organizationRootCommands = [
  command("organization", "Inspect and manage organizations", [
    pagedRead("list", "List organizations", listOrganizations, namedTable("ORGANIZATION", "No organizations.")),
    projectedRead("get <organization>", "Show an organization", getOrganization, mutationWritten("Organization", "organization")),
    projectedBodyUpdate("create", "Create an organization", createOrganization, undefined, mutationWritten("Created organization")),
    projectedBodyUpdate("update <organization>", "Update a selected organization", updateOrganization, undefined, mutationWritten("Updated organization", "organization")),
    projectedDelete("delete <organization>", "Delete a selected organization", deleteOrganization, mutationWritten("Deleted organization", "organization")),
  ]),
];
