import { command } from "@eyeauras/cli-factory";
import { projectedBodyUpdate, projectedDelete, pagedRead, projectedRead, readCommand, pageOptions, readOptions } from "./cli-support.js";
import {
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
  command("group", "Inspect user groups", [
    pagedRead("list", "List groups", listGroups, groupTable),
    projectedRead("get <group>", "Show a group", getGroup, groupRecord),
    command("member", "Inspect group members", [
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
  command("team", "Inspect the project team (YouTrack 2026.1+)", [
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
