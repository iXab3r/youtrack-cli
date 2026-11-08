import { command, type CommandDefinition } from "@eyeauras/cli-factory";
import { pagedRead, projectedRead, projectedBodyUpdate, projectedDelete } from "./cli-support.js";
import {
  getBuildBundle,
  createVersionBundle, updateVersionBundle, deleteVersionBundle, deleteVersionValue,
  createVersionValue,
  updateVersionValue,
  getBuildValue,
  getOwnedBundle,
  getOwnedValue,
  getVersionBundle,
  getVersionValue,
  listBuildBundles,
  listBuildValues,
  listOwnedBundles,
  listOwnedValues,
  listVersionBundles,
  listVersionValues,
} from "./bundle-values.js";
import { mutationWritten, namedTable, bundleValueWritten } from "./presentation.js";

const bundleTable = namedTable("BUNDLE", "No bundles.");
const valueTable = namedTable("VALUE", "No values.");

export const bundleValuesChildren: readonly CommandDefinition[] = [
  command("build", "Inspect build bundles", [
    pagedRead("list", "List build bundles", listBuildBundles, bundleTable),
    projectedRead("get <bundle>", "Show a build bundle", getBuildBundle),
    command("value", "Inspect build values", [
      pagedRead("list <bundle>", "List the bundle's values", listBuildValues, valueTable),
      projectedRead("get <bundle> <value>", "Show a build value", getBuildValue),
    ]),
  ]),
  command("owned", "Inspect owned-field bundles", [
    pagedRead("list", "List owned-field bundles", listOwnedBundles, bundleTable),
    projectedRead("get <bundle>", "Show an owned-field bundle", getOwnedBundle),
    command("value", "Inspect owned values", [
      pagedRead("list <bundle>", "List the bundle's values", listOwnedValues, valueTable),
      projectedRead("get <bundle> <value>", "Show an owned value", getOwnedValue),
    ]),
  ]),
  command("version", "Inspect and manage version bundles", [
    projectedBodyUpdate("create", "Create a version bundle", createVersionBundle, undefined, mutationWritten("Created version bundle")),
    projectedBodyUpdate("update <bundle>", "Update a version bundle", updateVersionBundle, undefined, mutationWritten("Updated version bundle", "bundle")),
    projectedDelete("delete <bundle>", "Delete a selected version bundle", deleteVersionBundle, mutationWritten("Deleted version bundle", "bundle")),
    pagedRead("list", "List version bundles", listVersionBundles, bundleTable),
    projectedRead("get <bundle>", "Show a version bundle", getVersionBundle),
    command("value", "Inspect and manage version values", [
      projectedDelete("delete <bundle> <value>", "Delete a selected version value", deleteVersionValue, mutationWritten("Deleted version value", "value", "bundle")),
      projectedBodyUpdate("update <bundle> <value>", "Update a version value", updateVersionValue, undefined, bundleValueWritten),
      projectedBodyUpdate("create <bundle>", "Create a version value", createVersionValue, undefined, bundleValueWritten),
      pagedRead("list <bundle>", "List the bundle's values", listVersionValues, valueTable),
      projectedRead("get <bundle> <value>", "Show a version value", getVersionValue),
    ]),
  ]),
];
