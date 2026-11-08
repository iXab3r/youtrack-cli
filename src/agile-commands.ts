import { command } from "@eyeauras/cli-factory";
import { pagedRead, projectedBodyUpdate, projectedRead, bodyOptions, projectionOptions, readOptions, updateCommand, notificationOptions } from "./cli-support.js";
import { createAgile, updateAgile, createSprint, getAgile, getSprint, listAgiles, listSprints, updateSprint } from "./agile.js";
import { agileRecord, agileTable, agileWritten, withView, sprintRecord, sprintTable, sprintWritten } from "./presentation.js";

export const agileRootCommands = [
  command("agile", "Inspect and manage agile boards", [
    withView(agileWritten("Created"), updateCommand("create", "Create an agile board", (client, { options }) =>
      createAgile(client, options.body, { ...readOptions(options), ...(typeof options.template === "string" ? { template: options.template } : {}) }),
      [...bodyOptions, ...projectionOptions, { flags: "--template <name>", description: "Use a board template" }])),
    projectedBodyUpdate("update <agile>", "Update an agile board", updateAgile, undefined, agileWritten("Updated")),
    pagedRead("list", "List agile boards", listAgiles, agileTable),
    projectedRead("get <agile>", "Show an agile board", getAgile, agileRecord),
  ]),
  command("sprint", "Inspect and manage sprints", [
    pagedRead("list <agile>", "List a board's sprints", listSprints, sprintTable),
    projectedRead("get <agile> <sprint>", "Show a sprint (current for the current one)", getSprint, sprintRecord),
    projectedBodyUpdate("create <agile>", "Create a sprint", createSprint, undefined, sprintWritten("Created"), notificationOptions),
    projectedBodyUpdate("update <agile> <sprint>", "Update a sprint", updateSprint, undefined, sprintWritten("Updated")),
  ]),
];
