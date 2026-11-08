import { command, type CommandDefinition } from "@eyeauras/cli-factory";
import { pagedRead, projectedRead, projectedBodyUpdate } from "./cli-support.js";
import {
  getCustomField,
  getFieldDefaults, updateFieldDefaults,
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
import { fieldTable, fieldDefaultsRecord, namedTable, bundleValueWritten } from "./presentation.js";

const bundleTable = namedTable("BUNDLE", "No bundles.");
const valueTable = namedTable("VALUE", "No values.");

export const fieldCatalogRootCommands: readonly CommandDefinition[] = [
  command("field", "Inspect custom fields and their types", [
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
  command("enum", "Inspect enum bundles", [
    pagedRead("list", "List enum bundles", listEnumBundles, bundleTable),
    projectedRead("get <bundle>", "Show an enum bundle", getEnumBundle),
    command("value", "Inspect enum values", [
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
