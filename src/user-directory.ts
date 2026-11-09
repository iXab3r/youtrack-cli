import { fields, mutate, deleteObject, mutationBody, nullableText, credentialConnection, requiredText, narrative, type Connection, type ProjectionOptions, encodedID, readCollectionAt, readObjectAt } from "./client.js";

const bundleRoot = "api/admin/customFieldSettings/bundles/user";
const bundleFields = "id,name,isUpdateable";
const userFields = "id,login,fullName";
const groupFields = "id,name,usersCount,allUsersGroup";
const bundlePath = (bundleID: string) =>
  `${bundleRoot}/${encodedID(bundleID, "user bundle ID")}`;

export const listUserBundles = readCollectionAt(bundleRoot, bundleFields);
export const getUserBundle = readObjectAt(bundlePath, bundleFields);
export const listUserBundleMembers = readCollectionAt(
  (bundleID: string) => `${bundlePath(bundleID)}/aggregatedUsers`,
  userFields,
);
export const listUserBundleGroups = readCollectionAt(
  (bundleID: string) => `${bundlePath(bundleID)}/groups`,
  groupFields,
);
export const getUserBundleGroup = readObjectAt(
  (bundleID: string, groupID: string) =>
    `${bundlePath(bundleID)}/groups/${encodedID(groupID, "group ID")}`,
  groupFields,
);
export const listUserBundleIndividuals = readCollectionAt(
  (bundleID: string) => `${bundlePath(bundleID)}/individuals`,
  userFields,
);
export const getUserBundleIndividual = readObjectAt(
  (bundleID: string, userID: string) =>
    `${bundlePath(bundleID)}/individuals/${encodedID(userID, "user ID")}`,
  userFields,
);
export const getUser = readObjectAt(
  (userID: string) => `api/users/${encodedID(userID, "user ID or login")}`,
  userFields,
);


function memberBody(input: unknown) {
  const body = mutationBody(input);
  requiredText(narrative(body.id, "member ID"), "member ID");
  return body;
}

export async function addUserBundleGroup(connection: Connection, bundleID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, `${bundlePath(bundleID)}/groups`, memberBody(input), fields(options, groupFields));
}
export async function addUserBundleIndividual(connection: Connection, bundleID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, `${bundlePath(bundleID)}/individuals`, memberBody(input), fields(options, userFields));
}
export async function removeUserBundleGroup(connection: Connection, bundleID: string, groupID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `${bundlePath(bundleID)}/groups/${encodedID(groupID, "group ID")}`, options);
}
export async function removeUserBundleIndividual(connection: Connection, bundleID: string, userID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `${bundlePath(bundleID)}/individuals/${encodedID(userID, "user ID")}`, options);
}


const notificationFields = "id,notifyOnOwnChanges,emailNotificationsEnabled,mentionNotificationsEnabled," +
  "duplicateClusterNotificationsEnabled,mailboxIntegrationNotificationsEnabled,usePlainTextEmails," +
  "autoWatchOnComment,autoWatchOnCreate,autoWatchOnVote";
const notificationsPath = (userID: string) => `api/users/${encodedID(userID, "user ID or login")}/profiles/notifications`;
export const getUserNotifications = readObjectAt(notificationsPath, notificationFields);
export async function updateUserNotifications(connection: Connection, userID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, notificationsPath(userID), mutationBody(input), fields(options, notificationFields));
}


const generalProfileFields = "id,dateFieldFormat(id,presentation,pattern,datePattern),timezone(id,presentation,offset),locale(id,name,locale)";
const generalProfilePath = (userID: string) => `api/users/${encodedID(userID, "user ID")}/profiles/general`;
export const getUserGeneralProfile = readObjectAt(generalProfilePath, generalProfileFields);
export async function updateUserGeneralProfile(connection: Connection, userID: string, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  for (const attribute of ["dateFieldFormat", "timezone", "locale"]) {
    if (Object.hasOwn(body, attribute) && body[attribute] !== null) mutationBody(body[attribute]);
  }
  return mutate(connection, generalProfilePath(userID), body, fields(options, generalProfileFields));
}


const timeProfileFields = "id,periodFormat(id)";
const timeProfilePath = (userID: string) => `api/users/${encodedID(userID, "user ID")}/profiles/timetracking`;
export const getUserTimeProfile = readObjectAt(timeProfilePath, timeProfileFields);
export async function updateUserTimeProfile(connection: Connection, userID: string, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  if (Object.hasOwn(body, "periodFormat") && body.periodFormat !== null) mutationBody(body.periodFormat);
  return mutate(connection, timeProfilePath(userID), body, fields(options, timeProfileFields));
}


export const listUserSavedQueries = readCollectionAt(
  (userID: string) => `api/users/${encodedID(userID, "user ID")}/savedQueries`, "id,name,query",
);
export const listUserTags = readCollectionAt(
  (userID: string) => `api/users/${encodedID(userID, "user ID")}/tags`, "id,name",
);


function userBody(input: unknown, creating: boolean) {
  const body = mutationBody(input);
  if (creating || Object.hasOwn(body, "login")) narrative(body.login, "login");
  if (creating || Object.hasOwn(body, "password")) narrative(body.password, "initial password");
  if (Object.hasOwn(body, "email")) nullableText(body.email, "email");
  return body;
}
async function writeUser(connection: Connection, path: string, body: ReturnType<typeof userBody>, options: ProjectionOptions) {
  const password = body.password;
  const target = typeof password === "string" ? credentialConnection(connection, "Password submission") : connection;
  return mutate(target, path, body, fields(options, userFields), {
    ...options, ...(typeof password === "string" ? { sensitiveValues: [password] } : {}),
  });
}
export async function createUser(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  return writeUser(connection, "api/users", userBody(input, true), options);
}
export async function updateUser(connection: Connection, userID: string, input: unknown, options: ProjectionOptions = {}) {
  return writeUser(connection, `api/users/${encodedID(userID, "user ID or login")}`, userBody(input, false), options);
}


export async function createUserBundle(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, bundleRoot, mutationBody(input), fields(options, bundleFields));
}
export async function updateUserBundle(connection: Connection, bundleID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, bundlePath(bundleID), mutationBody(input), fields(options, bundleFields));
}
export async function deleteUserBundle(connection: Connection, bundleID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, bundlePath(bundleID), options);
}
