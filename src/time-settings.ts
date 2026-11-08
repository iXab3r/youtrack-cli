import { fields, mutate, deleteObject, mutationBody, narrative, requiredText, type Connection, type ProjectionOptions, encodedID, readCollectionAt, readObjectAt } from "./client.js";

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
