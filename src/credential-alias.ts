import { CliError, diagnosticCause, type CommandContext } from "@eyeauras/cli-factory";
import { scrubText } from "./client.js";

/** The two auxiliary credentials share selected-profile deletion and known-value diagnostics. */
export async function deleteStoredAlias(context: CommandContext, key: string, alias: string) {
  const token = await context.secrets.get("token") ?? "";
  context.signal.throwIfAborted();
  const value = await context.secrets.get(key);
  context.signal.throwIfAborted();
  // This check guards dispatch. Core0.7.1 may await an internal lookup after delete starts;
  // its public deletion API has no AbortSignal and cannot promise retention after dispatch.
  try {
    await context.secrets.delete(key);
  } catch (cause) {
    throw new CliError("Could not delete the stored credential; the deletion outcome is unknown.", {
      code: "credential.delete.failed", cause: diagnosticCause(cause, [token, ...(value === undefined ? [] : [value])]),
    });
  }
  return { alias: scrubText(alias, token, value === undefined ? [] : [value]), deleted: true };
}
