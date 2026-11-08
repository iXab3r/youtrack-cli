import { fields, mutate, deleteObject, mutationBody, namedMutationBody, type Connection, type ProjectionOptions, encodedID, readCollectionAt, readObjectAt } from "./client.js";

type BundleKind = "build" | "ownedField" | "version";

const root = "api/admin/customFieldSettings/bundles";
const bundleFields = "id,name,isUpdateable";
const valueFields = "id,name,description,archived,ordinal";
const buildValueFields = `${valueFields},assembleDate`;
const ownedValueFields = `${valueFields},owner(id,login)`;
const versionValueFields = `${valueFields},released,releaseDate,startDate`;
const bundlePath = (kind: BundleKind, bundleID?: string) =>
  `${root}/${kind}` +
  (bundleID === undefined ? "" : `/${encodedID(bundleID, "bundle ID")}`);
const valuePath = (kind: BundleKind, bundleID: string, valueID?: string) =>
  `${bundlePath(kind, bundleID)}/values` +
  (valueID === undefined ? "" : `/${encodedID(valueID, "value ID")}`);

export const listBuildBundles = readCollectionAt(bundlePath("build"), bundleFields);
export const getBuildBundle = readObjectAt(
  (bundleID: string) => bundlePath("build", bundleID),
  bundleFields,
);
export const listBuildValues = readCollectionAt(
  (bundleID: string) => valuePath("build", bundleID),
  buildValueFields,
);
export const getBuildValue = readObjectAt(
  (bundleID: string, valueID: string) => valuePath("build", bundleID, valueID),
  buildValueFields,
);
export const listOwnedBundles = readCollectionAt(bundlePath("ownedField"), bundleFields);
export const getOwnedBundle = readObjectAt(
  (bundleID: string) => bundlePath("ownedField", bundleID),
  bundleFields,
);
export const listOwnedValues = readCollectionAt(
  (bundleID: string) => valuePath("ownedField", bundleID),
  ownedValueFields,
);
export const getOwnedValue = readObjectAt(
  (bundleID: string, valueID: string) => valuePath("ownedField", bundleID, valueID),
  ownedValueFields,
);
export const listVersionBundles = readCollectionAt(bundlePath("version"), bundleFields);
export const getVersionBundle = readObjectAt(
  (bundleID: string) => bundlePath("version", bundleID),
  bundleFields,
);
export const listVersionValues = readCollectionAt(
  (bundleID: string) => valuePath("version", bundleID),
  versionValueFields,
);
export const getVersionValue = readObjectAt(
  (bundleID: string, valueID: string) => valuePath("version", bundleID, valueID),
  versionValueFields,
);

export async function createVersionValue(connection: Connection, bundleID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, valuePath("version", bundleID), namedMutationBody(input, true), fields(options, versionValueFields));
}

export async function updateVersionValue(connection: Connection, bundleID: string, valueID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, valuePath("version", bundleID, valueID), namedMutationBody(input, false), fields(options, versionValueFields));
}


export async function createVersionBundle(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, bundlePath("version"), mutationBody(input), fields(options, bundleFields));
}
export async function updateVersionBundle(connection: Connection, bundleID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, bundlePath("version", bundleID), mutationBody(input), fields(options, bundleFields));
}
export async function deleteVersionBundle(connection: Connection, bundleID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, bundlePath("version", bundleID), options);
}
export async function deleteVersionValue(connection: Connection, bundleID: string, valueID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, valuePath("version", bundleID, valueID), options);
}


export async function createBuildBundle(connection: Connection, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, bundlePath("build"), mutationBody(input), fields(options, bundleFields));
}
export async function updateBuildBundle(connection: Connection, bundleID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, bundlePath("build", bundleID), mutationBody(input), fields(options, bundleFields));
}
export async function deleteBuildBundle(connection: Connection, bundleID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, bundlePath("build", bundleID), options);
}
export async function createBuildValue(connection: Connection, bundleID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, valuePath("build", bundleID), namedMutationBody(input, true), fields(options, buildValueFields));
}
export async function updateBuildValue(connection: Connection, bundleID: string, valueID: string, input: unknown, options: ProjectionOptions = {}) {
  return mutate(connection, valuePath("build", bundleID, valueID), namedMutationBody(input, false), fields(options, buildValueFields));
}
export async function deleteBuildValue(connection: Connection, bundleID: string, valueID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, valuePath("build", bundleID, valueID), options);
}
