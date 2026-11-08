import { attachmentForm } from "./attachment-form.js";
import {
  encodedID,
  mutate,
  mutationBody,
  nullableText,
  requiredText,
  deleteObject,
  fields,
  readCollectionAt,
  readNullableObject,
  readObjectAt,
  uploadObjectCollection,
  type WriteOptions,
  type Connection,
  type PageOptions,
  type ProjectionOptions,
  type YouTrackObject,
} from "./client.js";

const attachmentFields = "id,name,size,mimeType";
const articleListFields = "id,idReadable,summary,project(id,shortName),updated";
const articleDetailFields = `${articleListFields},content,parentArticle(id,idReadable),created`;

function articlePath(articleID: string): string {
  return `api/articles/${encodedID(articleID, "article ID")}`;
}

export const listArticleAttachments = readCollectionAt(
  (articleID: string) => `${articlePath(articleID)}/attachments`,
  attachmentFields,
);
export const getArticleAttachment = readObjectAt(
  (articleID: string, attachmentID: string) =>
    `${articlePath(articleID)}/attachments/${encodedID(attachmentID, "attachment ID")}`,
  attachmentFields,
);

export async function uploadArticleAttachment(
  connection: Connection,
  articleID: string,
  filePath: string,
  options: WriteOptions = {},
): Promise<YouTrackObject[] | null> {
  const path = `${articlePath(articleID)}/attachments`;
  const projection = fields(options, attachmentFields);
  const form = await attachmentForm(filePath);
  return uploadObjectCollection(connection, path, form, projection, options);
}

export const listChildArticles = readCollectionAt(
  (articleID: string) => `${articlePath(articleID)}/childArticles`,
  articleListFields,
);
export const getChildArticle = readObjectAt(
  (articleID: string, childID: string) =>
    `${articlePath(articleID)}/childArticles/${encodedID(childID, "child article ID")}`,
  articleDetailFields,
);

export async function getParentArticle(
  connection: Connection,
  articleID: string,
  options: ProjectionOptions = {},
): Promise<YouTrackObject | null> {
  return readNullableObject(
    connection,
    `${articlePath(articleID)}/parentArticle`,
    { fields: fields(options, articleDetailFields) },
  );
}


const tagFields = "id,name,owner(id,login)";
export const listArticleTags = readCollectionAt((articleID: string) => `${articlePath(articleID)}/tags`, tagFields);
export const getArticleTag = readObjectAt((articleID: string, tagID: string) => `${articlePath(articleID)}/tags/${encodedID(tagID, "tag ID")}`, tagFields);
export async function addArticleTag(connection: Connection, articleID: string, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  return mutate(connection, `${articlePath(articleID)}/tags`, { ...body, id: requiredText(body.id as string, "tag ID") }, fields(options, tagFields));
}
export async function removeArticleTag(connection: Connection, articleID: string, tagID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `${articlePath(articleID)}/tags/${encodedID(tagID, "tag ID")}`, options);
}


export async function updateArticleAttachment(connection: Connection, articleID: string, attachmentID: string, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  return mutate(connection, `${articlePath(articleID)}/attachments/${encodedID(attachmentID, "attachment ID")}`, {
    ...body, ...(Object.hasOwn(body, "name") ? { name: requiredText(body.name as string, "name") } : {}),
  }, fields(options, attachmentFields));
}
export async function deleteArticleAttachment(connection: Connection, articleID: string, attachmentID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `${articlePath(articleID)}/attachments/${encodedID(attachmentID, "attachment ID")}`, options);
}


const articleReactionFields = "id,reaction,author(id,login)";
const articleReactionsPath = (articleID: string, commentID: string) => `${articlePath(articleID)}/comments/${encodedID(commentID, "comment ID")}/reactions`;
export const listArticleReactions = readCollectionAt(articleReactionsPath, articleReactionFields);
export const getArticleReaction = readObjectAt((articleID: string, commentID: string, reactionID: string) => `${articleReactionsPath(articleID, commentID)}/${encodedID(reactionID, "reaction ID")}`, articleReactionFields);
export async function addArticleReaction(connection: Connection, articleID: string, commentID: string, input: unknown, options: ProjectionOptions = {}) {
  const body = mutationBody(input);
  return mutate(connection, articleReactionsPath(articleID, commentID), { ...body, reaction: nullableText(body.reaction, "reaction") }, fields(options, articleReactionFields));
}
export async function removeArticleReaction(connection: Connection, articleID: string, commentID: string, reactionID: string, options: ProjectionOptions = {}) {
  return deleteObject(connection, `${articleReactionsPath(articleID, commentID)}/${encodedID(reactionID, "reaction ID")}`, options);
}
