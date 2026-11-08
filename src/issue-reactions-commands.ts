import { command } from "@eyeauras/cli-factory";
import { pagedRead, projectedRead, projectedBodyUpdate, updateCommand, projectionOptions, readOptions } from "./cli-support.js";
import { listIssueReactions, getIssueReaction, addIssueReaction, removeIssueReaction } from "./issue-reactions.js";
import { arg, done, reactionTable, reactionRecord, withView } from "./presentation.js";

export const issueReactionCommand = command("reaction", "Read and change comment reactions", [
  pagedRead("list <issueID> <commentID>", "List comment reactions", listIssueReactions, reactionTable),
  projectedRead("get <issueID> <commentID> <reactionID>", "Show a comment reaction", getIssueReaction, reactionRecord),
  projectedBodyUpdate("add <issueID> <commentID>", "Add a comment reaction", addIssueReaction, undefined, reactionRecord),
  withView(done(context => `Removed reaction ${arg(context, "reactionID")}.`), updateCommand(
    "remove <issueID> <commentID> <reactionID>", "Remove a comment reaction", (client, { args, options }) =>
      removeIssueReaction(client, args.issueID, args.commentID, args.reactionID, readOptions(options)), projectionOptions,
  )),
]);
