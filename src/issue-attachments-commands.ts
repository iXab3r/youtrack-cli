import { command } from "@eyeauras/cli-factory";
import { inputFilePath } from "./client.js";
import { attachmentDownloadCommand } from "./attachment-download-commands.js";
import { pagedRead, projectedRead, updateCommand, projectedBodyUpdate, notificationOptions, projectionOptions, readOptions, writeOptions } from "./cli-support.js";
import {
  getIssueAttachment,
  updateIssueAttachment,
  deleteIssueAttachment,
  listIssueAttachments,
  uploadIssueAttachment,
} from "./issue-attachments.js";
import { attachmentRecord, attachmentTable, uploadedAttachments, withView, done, arg, updatedAttachment } from "./presentation.js";

export const attachmentsIssueChildren = [
  command("attachments", "Inspect, upload or download attachments", [
    attachmentDownloadCommand,
    projectedBodyUpdate("update <issueID> <attachmentID>", "Update an attachment", updateIssueAttachment, undefined, updatedAttachment),
    withView(done(context => `Deleted attachment ${arg(context, "attachmentID")}.`), updateCommand(
      "delete <issueID> <attachmentID>", "Delete an attachment", (client, { args, options }) =>
        deleteIssueAttachment(client, args.issueID, args.attachmentID, readOptions(options)), projectionOptions,
    )),
    pagedRead("list <issueID>", "List attachments", listIssueAttachments, attachmentTable),
    projectedRead("get <issueID> <attachmentID>", "Show an attachment", getIssueAttachment, attachmentRecord),
    withView(uploadedAttachments, updateCommand(
      "upload <issueID>",
      "Upload a file to the issue",
      async (connection, { args, options }, context) =>
        uploadIssueAttachment(
          connection,
          args.issueID,
          String(options.file),
          writeOptions(options),
        ),
      [
          ...projectionOptions, ...notificationOptions,
          {
            flags: "--file <path>",
            description: "Local file to upload",
            required: true,
            parse: inputFilePath,
          },
        ],
    )),
  ]),
];
