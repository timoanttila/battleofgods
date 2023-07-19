import {newDate, newId, runQuery, sanitizeContent, slugify, updateUser} from './helpers'
import type {Body, Env, Result} from './types'

interface Comment {
  content: string
  created: string
  id: number
  page_id: number
  updated: string
  user_id: number
  user_name: string
  user_uuid: string
}

/**
 * Handles comments for a specific page based on the given pageId, method, and request body.
 * @param env The environment object containing the database connection.
 * @param pageId The ID of the page to handle comments for.
 * @param method The HTTP method used for the comments (e.g., 'post' or 'get').
 * @param body The request body containing the comment content, userId, and userName (optional for 'get' method).
 * @returns A Promise that resolves to a Result object with the result of the comment operation.
 */
export const addComment = async (env: Env, pageId: string, body: Body | undefined = undefined): Promise<Result> => {
  if (!body?.content || !body?.userId || !body?.userName) {
    return {data: 'Missing information. Mandatory information are content, userId and userName.', status: 400}
  }

  const userId = slugify(body.userId)
  try {
    await updateUser(env, userId, body.userName)

    const content = sanitizeContent(String(body.content))
    const id = newId()
    const date = newDate()

    await runQuery(env, 'INSERT INTO comments (id, content, pageId, created, createdBy, updated, updatedBy) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, content, pageId, date, userId, date, userId])

    return {data: 'New reply created. The message is checked before publication.', status: 201}
  } catch (error) {
    console.error('Error while adding a new comment:', error)
    return {data: 'Error occurred while adding a new comment.', status: 400}
  }
}

/**
 * Retrieves comments related to a specific page.
 * @param env The environment object containing the database connection.
 * @param pageId The ID of the page.
 * @returns A Promise that resolves to a Result object with the list of videos and their metadata or an error response.
 */
export const getComments = async (env: Env, pageId: string): Promise<Result> => {
  const data: Comment[] | [] = await runQuery(env, 'SELECT comments.*, userName FROM comments INNER JOIN users ON users.id = comments.createdBy WHERE comments.pageId = ? ORDER BY comments.created ASC', [pageId])

  if (!data.length) {
    return {status: 204}
  }

  return {data, status: 200}
}
