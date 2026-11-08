import { command } from "@eyeauras/cli-factory";
import { pagedRead, projectedRead, projectedBodyUpdate, projectedDelete } from "./cli-support.js";
import {
  updateWorkTimeSettings, createWorkItemType, updateWorkItemType, deleteWorkItemType,
  updateProjectTimeSettings,
  addProjectWorkItemType, removeProjectWorkItemType,
  getGlobalTimeSettings,
  getProjectTimeSettings,
  getProjectWorkItemType,
  getWorkItemType,
  getWorkTimeSettings,
  listProjectWorkItemTypes,
  listWorkItemTypes,
} from "./time-settings.js";
import { projectTimeRecord, mutationWritten, namedTable } from "./presentation.js";

const typeTable = namedTable("TYPE", "No work item types.");

export const timeSettingsRootCommands = [
  command("time-tracking", "Inspect and manage time-tracking settings", [
    command("settings", "Inspect global time-tracking settings", [
      projectedRead("get", "Show the global time settings", getGlobalTimeSettings),
    ]),
    command("work-time", "Inspect and manage the work schedule", [
      projectedBodyUpdate("update", "Update the work schedule", updateWorkTimeSettings, undefined, mutationWritten("Updated work schedule")),
      projectedRead("get", "Show the work schedule", getWorkTimeSettings),
    ]),
  ]),
  command("work-item-type", "Inspect and manage work item types", [
    projectedBodyUpdate("create", "Create a work item type", createWorkItemType, undefined, mutationWritten("Created work item type")),
    projectedBodyUpdate("update <type>", "Update a selected work item type", updateWorkItemType, undefined, mutationWritten("Updated work item type", "type")),
    projectedDelete("delete <type>", "Delete a selected work item type", deleteWorkItemType, mutationWritten("Deleted work item type", "type")),
    pagedRead("list", "List work item types", listWorkItemTypes, typeTable),
    projectedRead("get <type>", "Show a work item type", getWorkItemType),
  ]),
];

export const timeSettingsProjectChildren = [
  command("time-tracking", "Manage project time-tracking settings", [
    projectedBodyUpdate("update <project>", "Update project time-tracking settings", updateProjectTimeSettings, undefined, projectTimeRecord),
    projectedRead("get <project>", "Show the project's time-tracking settings", getProjectTimeSettings),
  ]),
  command("work-item-type", "Manage the project's work item types", [
    projectedBodyUpdate("create <project>", "Add an existing work item type", addProjectWorkItemType, undefined, mutationWritten("Added work item type", undefined, "project")),
    projectedDelete("delete <project> <type>", "Remove a work item type from the project", removeProjectWorkItemType, mutationWritten("Removed work item type", "type", "project")),
    pagedRead("list <project>", "List the project's work item types", listProjectWorkItemTypes, typeTable),
    projectedRead("get <project> <type>", "Show a project work item type", getProjectWorkItemType),
  ]),
];
