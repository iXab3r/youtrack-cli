import {
  deleteObject, encodedID, fields, issuePath, mutate, mutationBody, nullableText,
  readCollectionAt, readObjectAt, type Connection, type ProjectionOptions,
} from "./client.js";

const reactionFields = "id,reaction,author(id,login)";
const reactionPath = (issueID: string, commentID: string) =>
  `${issuePath(issueID)}/comments/${encodedID(commentID, "comment ID")}/reactions`;

export const listIssueReactions = readCollectionAt(reactionPath, reactionFields);
export const getIssueReaction = readObjectAt(
  (issueID: string, commentID: string, reactionID: string) => `${reactionPath(issueID, commentID)}/${encodedID(reactionID, "reaction ID")}`,
  reactionFields,
);
export async function addIssueReaction(connection: Connection, issueID: string, commentID: string, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  return mutate(connection, reactionPath(issueID, commentID), {
    ...body, reaction: nullableText(body.reaction, "reaction"),
  }, fields(options, reactionFields));
}
export async function removeIssueReaction(connection: Connection, issueID: string, commentID: string, reactionID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `${reactionPath(issueID, commentID)}/${encodedID(reactionID, "reaction ID")}`, options);
}
