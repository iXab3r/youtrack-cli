import { command, type CommandDefinition } from "@eyeauras/cli-factory";
import { pagedRead, projectedRead, projectedBodyUpdate, projectedDelete } from "./cli-support.js";
import {
  deleteCustomField, createCustomField, updateCustomField,
  getCustomField,
  listFieldInstances,
  getFieldDefaults, updateFieldDefaults,
  createEnumBundle, updateEnumBundle, deleteEnumBundle, deleteEnumValue,
  createEnumValue,
  updateEnumValue,
  getEnumBundle,
  getEnumValue,
  getStateBundle,
  createStateValue, updateStateValue,
  getStateValue,
  listCustomFields,
  listEnumBundles,
  listEnumValues,
  listFieldTypes,
  listStateBundles,
  listStateValues,
} from "./field-catalog.js";
import { mutationWritten, fieldTable, fieldInstanceTable, fieldDefaultsRecord, namedTable, bundleValueWritten } from "./presentation.js";

const bundleTable = namedTable("BUNDLE", "No bundles.");
const valueTable = namedTable("VALUE", "No values.");

export const fieldCatalogRootCommands: readonly CommandDefinition[] = [
  command("field", "Manage custom fields and inspect their types", [
    projectedDelete("delete <field>", "Delete a global custom field", deleteCustomField, mutationWritten("Deleted custom field", "field")),
    projectedBodyUpdate("create", "Create a global custom field", createCustomField, undefined, mutationWritten("Created field")),
    projectedBodyUpdate("update <field>", "Update a global custom field", updateCustomField, undefined, mutationWritten("Updated field", "field")),
    command("instance", "Inspect projects using a field", [
      pagedRead("list <field>", "List projects using the field", listFieldInstances, fieldInstanceTable),
    ]),
    command("defaults", "Read and change field defaults", [
      projectedRead("get <field>", "Show field defaults", getFieldDefaults, fieldDefaultsRecord),
      projectedBodyUpdate("update <field>", "Update field defaults", updateFieldDefaults, undefined, fieldDefaultsRecord),
    ]),
    pagedRead("list", "List custom fields", listCustomFields, fieldTable),
    projectedRead("get <field>", "Show a custom field", getCustomField),
    command("type", "Inspect custom-field types", [
      pagedRead("list", "List field types", listFieldTypes, namedTable("TYPE", "No field types.")),
    ]),
  ]),
];

export const fieldCatalogBundleChildren: readonly CommandDefinition[] = [
  command("enum", "Inspect and manage enum bundles", [
    projectedBodyUpdate("create", "Create an enum bundle", createEnumBundle, undefined, mutationWritten("Created enum bundle")),
    projectedBodyUpdate("update <bundle>", "Update an enum bundle", updateEnumBundle, undefined, mutationWritten("Updated enum bundle", "bundle")),
    projectedDelete("delete <bundle>", "Delete a selected enum bundle", deleteEnumBundle, mutationWritten("Deleted enum bundle", "bundle")),
    pagedRead("list", "List enum bundles", listEnumBundles, bundleTable),
    projectedRead("get <bundle>", "Show an enum bundle", getEnumBundle),
    command("value", "Inspect and manage enum values", [
      projectedDelete("delete <bundle> <value>", "Delete a selected enum value", deleteEnumValue, mutationWritten("Deleted enum value", "value", "bundle")),
      projectedBodyUpdate("update <bundle> <value>", "Update an enum value", updateEnumValue, undefined, bundleValueWritten),
      projectedBodyUpdate("create <bundle>", "Create an enum value", createEnumValue, undefined, bundleValueWritten),
      pagedRead("list <bundle>", "List the bundle's values", listEnumValues, valueTable),
      projectedRead("get <bundle> <value>", "Show an enum value", getEnumValue),
    ]),
  ]),
  command("state", "Inspect state bundles", [
    pagedRead("list", "List state bundles", listStateBundles, bundleTable),
    projectedRead("get <bundle>", "Show a state bundle", getStateBundle),
    command("value", "Inspect state values", [
      projectedBodyUpdate("create <bundle>", "Create a state value", createStateValue, undefined, bundleValueWritten),
      projectedBodyUpdate("update <bundle> <value>", "Update a state value", updateStateValue, undefined, bundleValueWritten),
      pagedRead("list <bundle>", "List the bundle's values", listStateValues, valueTable),
      projectedRead("get <bundle> <value>", "Show a state value", getStateValue),
    ]),
  ]),
];
