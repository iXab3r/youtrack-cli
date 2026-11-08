import {
  encodedID, fields, mutate, deleteObject, namedMutationBody, readCollectionAt, readObjectAt,
  type Connection, type ProjectionOptions,
} from "./client.js";

const root = "api/admin/organizations";
const organizationFields = "id,name";
const organizationPath = (organizationID: string) => `${root}/${encodedID(organizationID, "organization ID")}`;
export const listOrganizations = readCollectionAt(root, organizationFields);
export const getOrganization = readObjectAt(organizationPath, organizationFields);
export async function createOrganization(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, root, namedMutationBody(input, true), fields(options, organizationFields));
}
export async function updateOrganization(connection: Connection, organizationID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, organizationPath(organizationID), namedMutationBody(input, false), fields(options, organizationFields));
}
export async function deleteOrganization(connection: Connection, organizationID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, organizationPath(organizationID), options);
}
