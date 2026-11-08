import { issueReactionCommand } from "./issue-reactions-commands.js";
import { command, type OptionDefinition } from "@eyeauras/cli-factory";
import { projectedBodyUpdate, notificationOptions, pagedRead, projectedRead, readCommand, pageOptions, projectionOptions, readOptions, updateCommand } from "./cli-support.js";
import {
  activityCategories,
  getActivitiesPage,
  listActivities,
  getActivity,
  getComment,
  getIssueProject,
  setIssueProject,
  getIssueActivity,
  listIssueActivities,
  getIssueActivitiesPage,
  getVcsChange,
  createVcsChange,
  updateVcsChange,
  deleteVcsChange,
  listIssueSprints,
  listVcsChanges,
  updateComment,
  type ActivityOptions,
} from "./issue-context.js";
import { commentShown, commentUpdated, projectRecord, vcsRecord, arg, done, sprintTable, activityTable, activityRecord, withView } from "./presentation.js";

const activityOptions: readonly OptionDefinition[] = [
  ...projectionOptions,
  {
    flags: "--categories <categories>",
    description: "Comma-separated activity category IDs",
    required: true,
    parse: activityCategories,
  },
  {
    flags: "--cursor <cursor>",
    description: "beforeCursor or afterCursor from a previous page",
  },
  { flags: "--reverse", description: "Newest activities first" },
];

const activityFilters: readonly OptionDefinition[] = [
  { flags: "--author <author>", description: "Filter by activity author" },
  { flags: "--activity-start <timestamp>", description: "Activity interval start in milliseconds" },
  { flags: "--activity-end <timestamp>", description: "Activity interval end in milliseconds" },
];

function activityReadOptions(options: Record<string, unknown>): ActivityOptions {
  return {
    ...readOptions(options),
    categories: String(options.categories),
    ...(typeof options.issueQuery === "string" ? { issueQuery: options.issueQuery } : {}),
    ...(typeof options.author === "string" ? { author: options.author } : {}),
    ...(typeof options.activityStart === "string" ? { activityStart: options.activityStart } : {}),
    ...(typeof options.activityEnd === "string" ? { activityEnd: options.activityEnd } : {}),
    ...(typeof options.activityId === "string" ? { activityId: options.activityId } : {}),
    ...(options.reverse === undefined ? {} : { reverse: options.reverse === true }),
    ...(typeof options.cursor === "string" ? { cursor: options.cursor } : {}),
  };
}

export const contextRootCommands = [
  command("activities", "Inspect activities across issues", [
    withView(activityTable, readCommand("list", "List activity items across issues", (client, { options }) =>
      listActivities(client, { ...readOptions(options), ...activityReadOptions(options) }), [
        ...pageOptions, ...activityFilters,
        { flags: "--categories <categories>", description: "Comma-separated activity categories", required: true, parse: activityCategories },
        { flags: "--reverse", description: "Newest activities first" },
        { flags: "--issue-query <query>", description: "Filter the activity issues" },
      ])),
    projectedRead("get <activityID>", "Show an activity item", getActivity, activityRecord),
    readCommand(
      "page",
      "Read one cursor page of activities",
      async (connection, { options }, context) =>
        getActivitiesPage(connection, activityReadOptions(options)),
      [...activityOptions, ...activityFilters,
        { flags: "--activity-id <id>", description: "Center the page on an activity" },
        { flags: "--issue-query <query>", description: "Filter the activity issues" }],
    ),
  ]),
];

export const contextIssueChildren = [
  command("project", "Inspect or change the issue project", [
    projectedRead("get <issueID>", "Show the issue project", getIssueProject, projectRecord),
    projectedBodyUpdate("set <issueID>", "Move the issue to a project", setIssueProject, undefined,
      done(context => `Moved issue ${arg(context, "issueID")} to the selected project.`), notificationOptions),
  ]),
  command("activity", "Inspect the issue activity stream", [
    withView(activityTable, readCommand("list <issueID>", "List activity items", (client, { args, options }) =>
      listIssueActivities(client, args.issueID, { ...readOptions(options), ...activityReadOptions(options) }), [
        ...pageOptions, ...activityFilters,
        { flags: "--categories <categories>", description: "Comma-separated activity categories", required: true, parse: activityCategories },
        { flags: "--reverse", description: "Newest activities first" },
      ])),
    projectedRead("get <issueID> <activityID>", "Show an activity item", getIssueActivity, activityRecord),
    readCommand(
      "page <issueID>",
      "Read one cursor page of activities",
      async (connection, { args, options }, context) =>
        getIssueActivitiesPage(
          connection,
          args.issueID,
          activityReadOptions(options),
        ),
      [...activityOptions, ...activityFilters,
        { flags: "--activity-id <id>", description: "Center the page on an activity" }],
    ),
  ]),
  command("sprints", "Inspect the sprints that contain an issue", [
    pagedRead("list <issueID>", "List the issue's sprints", listIssueSprints, sprintTable),
  ]),
  command("vcs-changes", "Inspect linked VCS changes and pull requests", [
    projectedBodyUpdate("create <issueID>", "Link a VCS change", createVcsChange, undefined, vcsRecord, notificationOptions),
    projectedBodyUpdate("update <issueID> <changeID>", "Update the VCS change state", updateVcsChange, undefined, vcsRecord, notificationOptions),
    withView(done(context => `Removed VCS relation ${arg(context, "changeID")}.`), updateCommand(
      "delete <issueID> <changeID>", "Remove a VCS relation", (client, { args, options }) => deleteVcsChange(client, args.issueID, args.changeID, readOptions(options)), projectionOptions)),
    pagedRead("list <issueID>", "List VCS changes and pull requests", listVcsChanges),
    projectedRead(
      "get <issueID> <changeID>",
      "Show a VCS change or pull request",
      getVcsChange,
    ),
  ]),
];

export const contextCommentChildren = [
  issueReactionCommand,
  projectedRead("get <issueID> <commentID>", "Show a comment", getComment, commentShown),
  projectedBodyUpdate(
    "update <issueID> <commentID>",
    "Replace a comment's text",
    updateComment,
    "text",
    commentUpdated("issueID", "commentID"),
    notificationOptions,
  ),
];
