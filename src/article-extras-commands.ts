import { command } from "@eyeauras/cli-factory";
import { inputFilePath } from "./client.js";
import { articleAttachmentDownloadCommand } from "./attachment-download-commands.js";
import { pagedRead, projectedBodyUpdate, projectedRead, updateCommand, projectionOptions, readOptions } from "./cli-support.js";
import {
  getArticleAttachment,
  listArticleTags, getArticleTag, addArticleTag, removeArticleTag,
  getChildArticle,
  getParentArticle,
  listArticleAttachments,
  listChildArticles,
  uploadArticleAttachment,
} from "./article-extras.js";
import { articleRecord, articleTable, attachmentRecord, attachmentTable, uploadedAttachments, tagTable, tagRecord, tagAdded, arg, done, withView } from "./presentation.js";

export const articlesExtraChildren = [
  command("tag", "Read and change article tag relations", [
    pagedRead("list <article>", "List article tags", listArticleTags, tagTable),
    projectedRead("get <article> <tag>", "Show an article tag", getArticleTag, tagRecord),
    projectedBodyUpdate("add <article>", "Assign a tag to the article", addArticleTag, undefined, tagAdded),
    withView(done(context => `Removed tag ${arg(context, "tag")} from article ${arg(context, "article")}.`), updateCommand(
      "remove <article> <tag>", "Remove an article tag relation", (client, { args }) => removeArticleTag(client, args.article, args.tag))),
  ]),
  command("attachment", "Inspect, upload or download article attachments", [
    articleAttachmentDownloadCommand,
    pagedRead("list <article>", "List attachments", listArticleAttachments, attachmentTable),
    projectedRead("get <article> <attachment>", "Show an attachment", getArticleAttachment, attachmentRecord),
    withView(uploadedAttachments, updateCommand(
      "upload <article>",
      "Upload a file to the article",
      async (connection, { args, options }, context) =>
        uploadArticleAttachment(
          connection,
          args.article,
          String(options.file),
          readOptions(options),
        ),
      [
          ...projectionOptions,
          {
            flags: "--file <path>",
            description: "Local file to upload",
            required: true,
            parse: inputFilePath,
          },
        ],
    )),
  ]),
  command("child", "Inspect an article's child articles", [
    pagedRead("list <article>", "List the immediate child articles", listChildArticles, articleTable),
    projectedRead("get <article> <child>", "Show a child article", getChildArticle, articleRecord),
  ]),
  command("parent", "Inspect an article's parent", [
    projectedRead("get <article>", "Show the parent article", getParentArticle, articleRecord),
  ]),
];
