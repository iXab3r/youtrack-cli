import { attachmentForm } from "./attachment-form.js";
import {
  encodedID,
  deleteObject,
  fields,
  mutate,
  mutationBody,
  requiredText,
  issuePath,
  readCollectionAt,
  readObjectAt,
  uploadObjectCollection,
  type Connection,
  type YouTrackObject,
  type WriteOptions,
  type ProjectionOptions,
} from "./client.js";

const attachmentFields = "id,name,size,mimeType";

export const listIssueAttachments = readCollectionAt(
  (issueID: string) => `${issuePath(issueID)}/attachments`,
  attachmentFields,
);
export const getIssueAttachment = readObjectAt(
  (issueID: string, attachmentID: string) =>
    `${issuePath(issueID)}/attachments/${encodedID(attachmentID, "attachment ID")}`,
  attachmentFields,
);

export async function uploadIssueAttachment(
  connection: Connection,
  issueID: string,
  filePath: string,
  options: WriteOptions = {},
): Promise<YouTrackObject[] | null> {
  const path = `${issuePath(issueID)}/attachments`;
  const form = await attachmentForm(filePath);
  return uploadObjectCollection(connection, path, form, attachmentFields, options);
}

export async function updateIssueAttachment(connection: Connection, issueID: string, attachmentID: string, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  if (Object.hasOwn(body, "name")) requiredText(body.name as string, "attachment name");
  return mutate(connection, `${issuePath(issueID)}/attachments/${encodedID(attachmentID, "attachment ID")}`, body, fields(options, attachmentFields));
}

export async function deleteIssueAttachment(connection: Connection, issueID: string, attachmentID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `${issuePath(issueID)}/attachments/${encodedID(attachmentID, "attachment ID")}`, options);
}
