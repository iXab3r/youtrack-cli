import { nativeInt32, fields, mutate, deleteObject, mutationBody, namedMutationBody, narrative, requiredText, type Connection, type ProjectionOptions, encodedID, readCollectionAt, readObjectAt } from "./client.js";

const globalSettingsPath = "api/admin/timeTrackingSettings";
const typeFields = "id,name,autoAttached";
const workTimeFields = "id,minutesADay,workDays,firstDayOfWeek,daysAWeek";
const projectFields =
  "id,enabled,estimate(id,field(id,name)),timeSpent(id,field(id,name)),project(id,name,shortName)";
const projectSettingsPath = (project: string) =>
  `api/admin/projects/${encodedID(project, "project ID")}/timeTrackingSettings`;

export const getProjectTimeSettings = readObjectAt(projectSettingsPath, projectFields);
export const listProjectWorkItemTypes = readCollectionAt(
  (project: string) => `${projectSettingsPath(project)}/workItemTypes`,
  typeFields,
);
export const getProjectWorkItemType = readObjectAt(
  (project: string, type: string) =>
    `${projectSettingsPath(project)}/workItemTypes/${encodedID(type, "work item type ID")}`,
  typeFields,
);
export const getGlobalTimeSettings = readObjectAt(
  globalSettingsPath,
  `id,workTimeSettings(${workTimeFields})`,
);
export const listWorkItemTypes = readCollectionAt(
  `${globalSettingsPath}/workItemTypes`,
  typeFields,
);
export const getWorkItemType = readObjectAt(
  (type: string) => `${globalSettingsPath}/workItemTypes/${encodedID(type, "work item type ID")}`,
  typeFields,
);
export const getWorkTimeSettings = readObjectAt(
  `${globalSettingsPath}/workTimeSettings`,
  workTimeFields,
);


export async function addProjectWorkItemType(connection: Connection, projectID: string, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  requiredText(narrative(body.id, "work item type ID"), "work item type ID");
  return mutate(connection, `${projectSettingsPath(projectID)}/workItemTypes`, body, fields(options, typeFields));
}
export async function removeProjectWorkItemType(connection: Connection, projectID: string, typeID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `${projectSettingsPath(projectID)}/workItemTypes/${encodedID(typeID, "work item type ID")}`, options);
}


export async function updateProjectTimeSettings(connection: Connection, projectID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, projectSettingsPath(projectID), mutationBody(input), fields(options, projectFields));
}


function workItemTypeBody(input: unknown, creating: boolean) {
  const body = namedMutationBody(input, creating);
  if (Object.hasOwn(body, "autoAttached") && typeof body.autoAttached !== "boolean") throw new Error("The autoAttached flag must be boolean.");
  return body;
}
export async function createWorkItemType(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, `${globalSettingsPath}/workItemTypes`, workItemTypeBody(input, true), fields(options, typeFields));
}
export async function updateWorkItemType(connection: Connection, typeID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, `${globalSettingsPath}/workItemTypes/${encodedID(typeID, "work item type ID")}`, workItemTypeBody(input, false), fields(options, typeFields));
}
export async function deleteWorkItemType(connection: Connection, typeID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `${globalSettingsPath}/workItemTypes/${encodedID(typeID, "work item type ID")}`, options);
}


export async function updateWorkTimeSettings(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  if (Object.hasOwn(body, "minutesADay") && !nativeInt32(body.minutesADay)) throw new Error("The minutesADay value must be an Int32 number.");
  if (Object.hasOwn(body, "workDays") && (!Array.isArray(body.workDays) || !body.workDays.every(nativeInt32))) throw new Error("The workDays value must be an array of Int32 numbers.");
  return mutate(connection, `${globalSettingsPath}/workTimeSettings`, body, fields(options, workTimeFields));
}
