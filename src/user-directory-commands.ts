import { CliError, Permission, command, recordView } from "@eyeauras/cli-factory";
import { pagedRead, projectedRead, projectedBodyUpdate, projectedDelete, updateCommand, bodyOptions, projectionOptions, writeOptions } from "./cli-support.js";
import {
  createUser, updateUser, listUserSavedQueries, listUserTags,
  getUserTimeProfile, updateUserTimeProfile,
  getUserGeneralProfile, updateUserGeneralProfile,
  getUserNotifications, updateUserNotifications,
  addUserBundleGroup, addUserBundleIndividual, removeUserBundleGroup, removeUserBundleIndividual,
  getUser,
  getUserBundle,
  getUserBundleGroup,
  getUserBundleIndividual,
  listUserBundleGroups,
  listUserBundleIndividuals,
  listUserBundleMembers,
  listUserBundles,
} from "./user-directory.js";
import { savedQueryTable, tagTable, timeProfileRecord, generalProfileRecord, notificationRecord, rememberSubmittedIdentity, withView, mutationWritten, groupRecord, groupTable, namedTable, userRecord, userTable } from "./presentation.js";

import { mutationBody, scrubText } from "./client.js";

const passwordKey = (alias: string) => {
  if (!alias) throw new Error("The password alias must contain text.");
  return `user-initial-password:${alias}`;
};
function cliUserBody(input: unknown) {
  const body = mutationBody(input);
  if (Object.hasOwn(body, "password")) throw new Error("Use --password-secret for the initial password.");
  return body;
}

const bundleTable = namedTable("BUNDLE", "No user bundles.");

export const userDirectoryUserChildren = [
  command("initial-password", "Manage stored initial passwords", [
    command("import <alias>", "Import an initial password from environment", async ({ args }, context) => {
      const key = passwordKey(args.alias);
      const password = context.environment.YOUTRACK_INITIAL_PASSWORD;
      if (password === undefined || password.length === 0) throw new Error("Set YOUTRACK_INITIAL_PASSWORD to the initial password.");
      const token = await context.secrets.get("token") ?? "";
      await context.secrets.set(key, password);
      return { alias: scrubText(args.alias, token, [password]), stored: true };
    }, {
      permission: Permission.Update,
      options: [{ flags: "--from-env", description: "Read YOUTRACK_INITIAL_PASSWORD", required: true }],
      view: recordView<{ alias: string }>({ title: result => `Stored initial password ${result.alias}`, fields: [] }),
    }),
  ]),
  withView(mutationWritten("Created user"), updateCommand("create", "Create a user with stored initial password", async (connection, input, context) => {
    const body = cliUserBody(input.options.body);
    const alias = String(input.options.passwordSecret);
    const password = await context.secrets.get(passwordKey(alias));
    if (password === undefined || password.length === 0) throw new CliError("The initial password is not stored in this profile.", {
      code: "user.initial-password.missing", next: [["user", "initial-password", "import", alias, "--from-env"]],
    });
    const result = await createUser(connection, { ...body, password }, writeOptions(input.options));
    rememberSubmittedIdentity(input, connection.token, [password]);
    return result;
  }, [...bodyOptions, ...projectionOptions, { flags: "--password-secret <alias>", description: "Stored initial password alias", required: true }])),
  projectedBodyUpdate("update <user>", "Update a selected user", (connection, user, input, options) => updateUser(connection, user, cliUserBody(input), options), undefined, mutationWritten("Updated user", "user")),
  command("saved-queries", "Inspect a user's saved searches", [
    pagedRead("list <user>", "List the user's saved searches", listUserSavedQueries, savedQueryTable),
  ]),
  command("tags", "Inspect a user's tags", [
    pagedRead("list <user>", "List the user's tags", listUserTags, tagTable),
  ]),
  command("profile", "Inspect and change user profile settings", [
    command("time-tracking", "Manage user time-tracking preferences", [
      projectedRead("get <user>", "Show user time-tracking preferences", getUserTimeProfile, timeProfileRecord),
      projectedBodyUpdate("update <user>", "Update user time-tracking preferences", updateUserTimeProfile, undefined, timeProfileRecord),
    ]),
    command("general", "Manage general user preferences", [
      projectedRead("get <user>", "Show general user preferences", getUserGeneralProfile, generalProfileRecord),
      projectedBodyUpdate("update <user>", "Update general user preferences", updateUserGeneralProfile, undefined, generalProfileRecord),
    ]),
    command("notifications", "Manage notification preferences", [
      projectedRead("get <user>", "Show user notification preferences", getUserNotifications, notificationRecord),
      projectedBodyUpdate("update <user>", "Update user notification preferences", updateUserNotifications, undefined, notificationRecord),
    ]),
  ]),
  projectedRead("get <user>", "Show a user by ID or login", getUser, userRecord),
];

export const userDirectoryBundleChildren = [
  command("user", "Inspect assignee bundles", [
    pagedRead("list", "List user bundles", listUserBundles, bundleTable),
    projectedRead("get <bundle>", "Show a user bundle", getUserBundle),
    command("member", "Inspect all bundle users, including group members", [
      pagedRead("list <bundle>", "List all bundle users", listUserBundleMembers, userTable),
    ]),
    command("group", "Manage the bundle's groups", [
      projectedBodyUpdate("create <bundle>", "Add an existing group to the bundle", addUserBundleGroup, undefined, mutationWritten("Added group", undefined, "bundle")),
      projectedDelete("remove <bundle> <group>", "Remove a group from the bundle", removeUserBundleGroup, mutationWritten("Removed group", "group", "bundle")),
      pagedRead("list <bundle>", "List the bundle's groups", listUserBundleGroups, groupTable),
      projectedRead("get <bundle> <group>", "Show a bundle group", getUserBundleGroup, groupRecord),
    ]),
    command("individual", "Manage users added directly to the bundle", [
      projectedBodyUpdate("create <bundle>", "Add an existing user to the bundle", addUserBundleIndividual, undefined, mutationWritten("Added user", undefined, "bundle")),
      projectedDelete("remove <bundle> <user>", "Remove a user from the bundle", removeUserBundleIndividual, mutationWritten("Removed user", "user", "bundle")),
      pagedRead("list <bundle>", "List directly added users", listUserBundleIndividuals, userTable),
      projectedRead("get <bundle> <user>", "Show a directly added user", getUserBundleIndividual, userRecord),
    ]),
  ]),
];
