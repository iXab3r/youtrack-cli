import { command } from "@eyeauras/cli-factory";
import { projectedDelete, pagedRead, projectedBodyUpdate, projectedRead, bodyOptions, projectionOptions, readOptions, updateCommand, notificationOptions } from "./cli-support.js";
import { deleteAgile, deleteSprint, createAgile, updateAgile, createSprint, getAgile, getSprint, listAgiles, listSprints, updateSprint } from "./agile.js";
import { mutationWritten, rememberSubmittedIdentity, agileRecord, agileTable, agileWritten, withView, sprintRecord, sprintTable, sprintWritten } from "./presentation.js";

export const agileRootCommands = [
  command("agile", "Inspect and manage agile boards", [
    projectedDelete("delete <agile>", "Delete a selected board", deleteAgile, mutationWritten("Deleted board", "agile")),
    withView(agileWritten("Created"), updateCommand("create", "Create an agile board", async (client, input) => {
      const { options } = input;
      const result = await createAgile(client, options.body, { ...readOptions(options), ...(typeof options.template === "string" ? { template: options.template } : {}) });
      rememberSubmittedIdentity(input, client.token);
      return result;
    },
      [...bodyOptions, ...projectionOptions, { flags: "--template <name>", description: "Use a board template" }])),
    projectedBodyUpdate("update <agile>", "Update an agile board", updateAgile, undefined, agileWritten("Updated")),
    pagedRead("list", "List agile boards", listAgiles, agileTable),
    projectedRead("get <agile>", "Show an agile board", getAgile, agileRecord),
  ]),
  command("sprint", "Inspect and manage sprints", [
    projectedDelete("delete <agile> <sprint>", "Delete a selected sprint", deleteSprint, mutationWritten("Deleted sprint", "sprint", "agile")),
    pagedRead("list <agile>", "List a board's sprints", listSprints, sprintTable),
    projectedRead("get <agile> <sprint>", "Show a sprint (current for the current one)", getSprint, sprintRecord),
    projectedBodyUpdate("create <agile>", "Create a sprint", createSprint, undefined, sprintWritten("Created"), notificationOptions),
    projectedBodyUpdate("update <agile> <sprint>", "Update a sprint", updateSprint, undefined, sprintWritten("Updated")),
  ]),
];
