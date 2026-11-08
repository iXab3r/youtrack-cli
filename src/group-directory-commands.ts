import { command } from "@eyeauras/cli-factory";
import { projectedBodyUpdate, projectedDelete, pagedRead, projectedRead, readCommand, pageOptions, readOptions } from "./cli-support.js";
import {
  createGroup, updateGroup, deleteGroup,
  addGroupMember,
  updateProjectTeam,
  addProjectTeamGroup, removeProjectTeamGroup,
  addProjectTeamUser, removeProjectTeamUser,
  getGroup,
  getProjectTeam,
  listGroupMembers,
  listGroups,
  listProjectTeamGroups,
  listProjectTeamUsers,
  listSubgroups,
} from "./group-directory.js";
import { mutationWritten, groupRecord, groupTable, userTable, withView } from "./presentation.js";

const memberOptions = [
  ...pageOptions,
  { flags: "--direct", description: "Directly added users only" },
];

export const groupDirectoryRootCommands = [
  command("group", "Inspect and manage user groups", [
    projectedBodyUpdate("create", "Create a user group", createGroup, undefined, mutationWritten("Created group")),
    projectedBodyUpdate("update <group>", "Update a selected group", updateGroup, undefined, mutationWritten("Updated group", "group")),
    projectedDelete("delete <group>", "Delete a selected group", deleteGroup, mutationWritten("Deleted group", "group")),
    pagedRead("list", "List groups", listGroups, groupTable, [{ flags: "--query <query>", description: "Filter groups by query" }]),
    projectedRead("get <group>", "Show a group", getGroup, groupRecord),
    command("member", "Inspect and manage group members", [
      projectedBodyUpdate("add <group> <user>", "Add a direct group member", addGroupMember, undefined, mutationWritten("Added group member", "user", "group")),
      withView(userTable, readCommand(
        "list <group>",
        "List members, including inherited ones",
        async (connection, { args, options }, context) =>
          listGroupMembers(connection, args.group, {
            ...readOptions(options),
            direct: options.direct === true,
          }),
        memberOptions,
      )),
    ]),
    command("subgroup", "Inspect nested groups", [
      pagedRead("list <group>", "List the immediate subgroups", listSubgroups, groupTable),
    ]),
  ]),
];

export const groupDirectoryProjectChildren = [
  command("team", "Manage the project team (YouTrack 2026.1+)", [
    projectedBodyUpdate("update <project>", "Update direct team users and groups", updateProjectTeam, undefined, mutationWritten("Updated team", "project")),
    projectedRead("get <project>", "Show the team", getProjectTeam, groupRecord),
    command("group", "Manage the team's groups", [
      projectedBodyUpdate("add <project>", "Add a team group", addProjectTeamGroup, undefined, mutationWritten("Added team group", undefined, "project")),
      projectedDelete("remove <project> <group>", "Remove a team group", removeProjectTeamGroup, mutationWritten("Removed team group", "group", "project")),
      pagedRead("list <project>", "List the team's groups", listProjectTeamGroups, groupTable),
    ]),
    command("user", "Manage the team's users", [
      projectedBodyUpdate("add <project>", "Add a direct team user", addProjectTeamUser, undefined, mutationWritten("Added team user", undefined, "project")),
      projectedDelete("remove <project> <user>", "Remove a direct team user", removeProjectTeamUser, mutationWritten("Removed team user", "user", "project")),
      withView(userTable, readCommand(
        "list <project>",
        "List team users, including group members",
        async (connection, { args, options }, context) =>
          listProjectTeamUsers(connection, args.project, {
            ...readOptions(options),
            direct: options.direct === true,
          }),
        memberOptions,
      )),
    ]),
  ]),
];
