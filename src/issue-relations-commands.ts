import { command } from "@eyeauras/cli-factory";
import { bodyUpdate, projectedBodyUpdate, pagedRead, projectedRead, updateCommand, notificationOptions, projectionOptions, readOptions } from "./cli-support.js";
import {
  addIssueLink,
  addIssueTag,
  getIssueLink,
  getLinkType,
  getTag,
  getIssueTag,
  listIssueLinks,
  listIssueTags,
  listLinkedIssues,
  listLinkTypes,
  listTags,
  removeIssueLink,
  removeIssueTag,
} from "./issue-relations.js";
import {
  arg,
  done,
  issueLinked,
  issueTagList,
  linkGroupList,
  linkGroupRecord,
  linkTypeRecord,
  linkTypeTable,
  linkedIssueList,
  tagAdded,
  tagRecord,
  tagTable,
  withView,
} from "./presentation.js";

export const relationsRootCommands = [
  command("link-types", "Inspect issue link types", [
    pagedRead("list", "List link types", listLinkTypes, linkTypeTable),
    projectedRead("get <typeID>", "Show a link type", getLinkType, linkTypeRecord),
  ]),
  command("tags", "Inspect tags", [
    pagedRead("list", "List visible tags", listTags, tagTable, [{ flags: "--query <query>", description: "Filter tags by query" }]),
    projectedRead("get <tagID>", "Show a tag", getTag, tagRecord),
  ]),
];

export const relationsIssueChildren = [
  command("links", "Inspect and change issue links", [
    pagedRead("list <issueID>", "List the issue's link groups", listIssueLinks, linkGroupList),
    projectedRead("get <issueID> <linkID>", "Show a link group", getIssueLink, linkGroupRecord),
    pagedRead("issues <issueID> <linkID>", "List the issues in a link group", listLinkedIssues, linkedIssueList),
    projectedBodyUpdate("add <issueID> <linkID>", "Link an issue by database id", addIssueLink, undefined, issueLinked, notificationOptions),
    withView(done((context) => `Unlinked ${arg(context, "targetIssueID")} from ${arg(context, "issueID")}.`), updateCommand(
      "remove <issueID> <linkID> <targetIssueID>",
      "Unlink an issue",
      async (connection, { args, options }, context) =>
        removeIssueLink(
          connection,
          args.issueID,
          args.linkID,
          args.targetIssueID,
          readOptions(options),
        ),
      projectionOptions,
    )),
  ]),
  command("tags", "Inspect and change the issue's tags", [
    projectedRead("get <issueID> <tagID>", "Show an assigned tag", getIssueTag, tagRecord),
    pagedRead("list <issueID>", "List the issue's tags", listIssueTags, issueTagList),
    projectedBodyUpdate("add <issueID>", "Add a tag by database id", addIssueTag, undefined, tagAdded),
    withView(done((context) => `Removed tag ${arg(context, "tagID")} from ${arg(context, "issueID")}.`), updateCommand(
      "remove <issueID> <tagID>",
      "Remove a tag from the issue",
      async (connection, { args, options }, context) =>
        removeIssueTag(connection, args.issueID, args.tagID, readOptions(options)),
      projectionOptions,
    )),
  ]),
];
