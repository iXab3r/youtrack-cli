import { fields, mutate, deleteObject, mutationBody, namedMutationBody, narrative, requiredText, type Connection, type ProjectionOptions, encodedID, readCollectionAt, readObjectAt } from "./client.js";

const root = "api/admin/customFieldSettings";
const customFieldFields = "id,name,fieldType(id,presentation,valueType,isMultiValue),aliases";
const fieldTypeFields = "id,presentation,valueType,isMultiValue";
const bundleFields = "id,name,isUpdateable";
const enumValueFields = "id,name,localizedName,description,archived,ordinal";
const stateValueFields = `${enumValueFields},isResolved`;
const bundlePath = (kind: "enum" | "state", bundleID: string) =>
  `${root}/bundles/${kind}/${encodedID(bundleID, "bundle ID")}`;
const valuePath = (kind: "enum" | "state", bundleID: string, valueID?: string) =>
  `${bundlePath(kind, bundleID)}/values` +
  (valueID === undefined ? "" : `/${encodedID(valueID, "value ID")}`);

export const listCustomFields = readCollectionAt(`${root}/customFields`, customFieldFields);
export const getCustomField = readObjectAt(
  (fieldID: string) => `${root}/customFields/${encodedID(fieldID, "field ID")}`,
  customFieldFields,
);
export const listFieldTypes = readCollectionAt(`${root}/types`, fieldTypeFields);
export const listEnumBundles = readCollectionAt(`${root}/bundles/enum`, bundleFields);
export const getEnumBundle = readObjectAt(
  (bundleID: string) => bundlePath("enum", bundleID),
  bundleFields,
);
export const listEnumValues = readCollectionAt(
  (bundleID: string) => valuePath("enum", bundleID),
  enumValueFields,
);
export const getEnumValue = readObjectAt(
  (bundleID: string, valueID: string) => valuePath("enum", bundleID, valueID),
  enumValueFields,
);
export const listStateBundles = readCollectionAt(`${root}/bundles/state`, bundleFields);
export const getStateBundle = readObjectAt(
  (bundleID: string) => bundlePath("state", bundleID),
  bundleFields,
);
export const listStateValues = readCollectionAt(
  (bundleID: string) => valuePath("state", bundleID),
  stateValueFields,
);
export const getStateValue = readObjectAt(
  (bundleID: string, valueID: string) => valuePath("state", bundleID, valueID),
  stateValueFields,
);

export async function createEnumValue(connection: Connection, bundleID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, valuePath("enum", bundleID), namedMutationBody(input, true), fields(options, enumValueFields));
}

export async function updateEnumValue(connection: Connection, bundleID: string, valueID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, valuePath("enum", bundleID, valueID), namedMutationBody(input, false), fields(options, enumValueFields));
}

export async function createStateValue(connection: Connection, bundleID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, valuePath("state", bundleID), namedMutationBody(input, true), fields(options, stateValueFields));
}
export async function updateStateValue(connection: Connection, bundleID: string, valueID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, valuePath("state", bundleID, valueID), namedMutationBody(input, false), fields(options, stateValueFields));
}

const defaultsFields = "id,$type,canBeEmpty,emptyFieldText,isPublic,parent(id,name)";
const defaultsPath = (fieldID: string) => `${root}/customFields/${encodedID(fieldID, "field ID")}/fieldDefaults`;
export const getFieldDefaults = readObjectAt(defaultsPath, defaultsFields);
export async function updateFieldDefaults(connection: Connection, fieldID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, defaultsPath(fieldID), mutationBody(input), fields(options, defaultsFields));
}

export const listFieldInstances = readCollectionAt(
  (fieldID: string) => `${root}/customFields/${encodedID(fieldID, "field ID")}/instances`,
  "id,field(id,name),project(id,name,shortName),canBeEmpty,isPublic",
);


export async function createCustomField(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  const body = namedMutationBody(input, true);
  const fieldType = mutationBody(body.fieldType);
  requiredText(narrative(fieldType.id, "field type ID"), "field type ID");
  return mutate(connection, `${root}/customFields`, body, fields(options, customFieldFields));
}
export async function updateCustomField(connection: Connection, fieldID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, `${root}/customFields/${encodedID(fieldID, "field ID")}`, namedMutationBody(input, false), fields(options, customFieldFields));
}


export async function deleteCustomField(connection: Connection, fieldID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `${root}/customFields/${encodedID(fieldID, "field ID")}`, options);
}


export async function createEnumBundle(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, `${root}/bundles/enum`, mutationBody(input), fields(options, bundleFields));
}
export async function updateEnumBundle(connection: Connection, bundleID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, bundlePath("enum", bundleID), mutationBody(input), fields(options, bundleFields));
}
export async function deleteEnumBundle(connection: Connection, bundleID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, bundlePath("enum", bundleID), options);
}
export async function deleteEnumValue(connection: Connection, bundleID: string, valueID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, valuePath("enum", bundleID, valueID), options);
}
