import { command } from "@eyeauras/cli-factory";
import { pagedRead, projectedBodyUpdate, projectedRead, readCommand, pageOptions, readOptions, notificationOptions, updateCommand, projectionOptions } from "./cli-support.js";
import {
  addWorkItem,
  deleteIssueWorkItem,
  getIssueWorkItem,
  getTimeTracking,
  getWorkItem,
  listIssueWorkItems,
  listWorkItems,
  updateWorkItem,
} from "./issue-time.js";
import { withView, workItemTable, done, arg } from "./presentation.js";

export const timeRootCommands = [
  command("work-items", "Inspect work items across issues", [
    withView(workItemTable, readCommand(
      "list",
      "List work items",
      async (connection, { options }, context) => listWorkItems(connection, readOptions(options)),
      [
          ...pageOptions,
          { flags: "--query <query>", description: "Issue search query" },
        ],
    )),
    projectedRead("get <itemID>", "Show a work item", getWorkItem),
  ]),
];

export const timeIssueChildren = [
  command("time-tracking", "Inspect issue time tracking", [
    projectedRead("get <issueID>", "Show time-tracking status", getTimeTracking),
  ]),
  command("work-items", "Inspect and record time spent", [
    withView(done(context => `Deleted work item ${arg(context, "itemID")}.`), updateCommand(
      "delete <issueID> <itemID>", "Delete a work item", (client, { args, options }) =>
        deleteIssueWorkItem(client, args.issueID, args.itemID, readOptions(options)), projectionOptions,
    )),
    pagedRead("list <issueID>", "List the issue's work items", listIssueWorkItems, workItemTable),
    projectedRead("get <issueID> <itemID>", "Show a work item", getIssueWorkItem),
    projectedBodyUpdate("add <issueID>", "Add a work item", addWorkItem, undefined, undefined, notificationOptions),
    projectedBodyUpdate("update <issueID> <itemID>", "Update a work item", updateWorkItem, undefined, undefined, notificationOptions),
  ]),
];
