import { command } from "@eyeauras/cli-factory";
import { pagedRead, projectedRead, projectedBodyUpdate, projectedDelete } from "./cli-support.js";
import {
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
import { mutationWritten, groupRecord, groupTable, namedTable, userRecord, userTable } from "./presentation.js";

const bundleTable = namedTable("BUNDLE", "No user bundles.");

export const userDirectoryUserChildren = [
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
      projectedBodyUpdate("create <bundle>", "Add an existing group to the bundle", addUserBundleGroup, undefined, mutationWritten("Added group", "bundle")),
      projectedDelete("remove <bundle> <group>", "Remove a group from the bundle", removeUserBundleGroup, mutationWritten("Removed group", "group", "bundle")),
      pagedRead("list <bundle>", "List the bundle's groups", listUserBundleGroups, groupTable),
      projectedRead("get <bundle> <group>", "Show a bundle group", getUserBundleGroup, groupRecord),
    ]),
    command("individual", "Manage users added directly to the bundle", [
      projectedBodyUpdate("create <bundle>", "Add an existing user to the bundle", addUserBundleIndividual, undefined, mutationWritten("Added user", "bundle")),
      projectedDelete("remove <bundle> <user>", "Remove a user from the bundle", removeUserBundleIndividual, mutationWritten("Removed user", "user", "bundle")),
      pagedRead("list <bundle>", "List directly added users", listUserBundleIndividuals, userTable),
      projectedRead("get <bundle> <user>", "Show a directly added user", getUserBundleIndividual, userRecord),
    ]),
  ]),
];
