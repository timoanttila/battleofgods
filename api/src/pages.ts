import {newDate, newId, runQuery, sanitizeContent, slugify, updateUser} from './helpers'
import type {Body, Env, Page, Result} from './types'

/**
 * Fetches religions data from the database based on the given religion slug.
 * @param env The environment object containing the database connection.
 * @param religionSlug The optional religion slug to filter the results (defaults to null).
 * @returns A Promise that resolves to a Result object with the fetched religions data.
 */
export const getReligions = async (env: Env, religionSlug: string | null = null): Promise<Result> => {
  let binds: any[] = []
  let query = `SELECT * FROM religions WHERE parent = ''`

  if (religionSlug) {
    binds.push(religionSlug)
    query += ' AND religions.slug = ?'
  }

  query += ' ORDER BY id ASC'

  const data = await runQuery(env, query, binds)
  return {data, status: 200}
}

/**
 * Retrieves a page by its ID from the database.
 * @param env The environment object containing the database connection.
 * @param requests An array containing the requested page information [type, pageId].
 * @return A promise that resolves to a Result object with page data and status code.
 */
export const getPageById = async (env: Env, requests: string[]): Promise<Result> => {
  const type = slugify(requests[0])
  const pageId = slugify(requests[1])

  try {
    const data: Page[] = await runQuery(env, `SELECT * FROM ${type} WHERE id = ? LIMIT 1`, [pageId])

    if (!data.length) {
      return {data: 'Page not found.', status: 404}
    }

    return {data: data[0], status: 200}
  } catch (error) {
    return {status: 500}
  }
}

/**
 * Updates a page with new content using the given page object and request body.
 * @param env The environment object containing the database connection.
 * @param page The page object representing the page to be updated.
 * @param method The HTTP method used for the update (should be 'put').
 * @param body The request body containing the updated content, userId, and userName.
 * @returns A Promise that resolves to a Result object with the result of the update operation.
 */
export const pageUpdate = async (env: Env, type: string, pageId: string, body: Body): Promise<Result> => {
  if (!body.content || !body.userId || !body.userName) {
    return {data: 'Missing information. Mandatory information are content, userId, and userName.', status: 400}
  }

  if (!pageId) {
    return {data: 'Missing information. Page not found.', status: 400}
  }

  const userId = slugify(body.userId)

  const userStatus = await updateUser(env, userId, body.userName)
  if (!userStatus) {
    return {data: {error: 'Problem updating user information.'}, status: 400}
  }

  const content = sanitizeContent(body.content)
  const id = newId()
  const date = newDate()

  await runQuery(env, 'INSERT INTO pages_temp VALUES (?, ?, ?, ?, ?, ?)', [id, pageId, type, content, date, userId])

  return {data: {message: 'A new version of the article is awaiting approval. Thanks for helping.'}, status: 201}
}

/**
 * Fetches pages data from the database based on the given religion and query parameters.
 * GET /religions/:religion/pages
 * GET /religions/:religion/pages/:slug
 * @param env The environment object containing the database connection.
 * @param requests The array of request path components.
 * @param queryParams The URLSearchParams object containing the query parameters.
 * @returns A Promise that resolves to a Result object with the fetched pages data.
 */

export const getPagesByReligion = async (env: Env, requests: string[], queryParams: URLSearchParams): Promise<Result> => {
  const religion = slugify(requests[1])
  const binds: any[] = [religion]
  let data: Page[] = []

  let sql = 'SELECT pages.*, religions.name religion_name FROM pages INNER JOIN religions ON pages.religion_id = religions.id WHERE religions.slug = ?'

  if (requests.length === 4) {
    const slug = slugify(requests[3])
    data = await runQuery(env, `${sql} AND pages.slug = ? LIMIT 1`, [...binds, slug])

    if (!data.length) {
      return {data: 'Page not found.', status: 404}
    }

    return {data: data[0], status: 200}
  }

  const where: string[] = []
  let order = 'pages.title ASC'

  if (queryParams.get('search')) {
    const search = sanitizeContent(String(queryParams.get('search')))
    where.push('video_title LIKE ?')
    binds.push(`%${search}%`)
    order = 'pages.updated DESC'
  }

  if (queryParams.get('topic')) {
    const topic = slugify(String(queryParams.get('topic')))
    where.push('pages.topic_id = ?')
    binds.push(topic)
    order = 'pages.updated DESC'
  }

  sql += where.length ? ` AND ${where.join(' AND ')}` : ''
  data = await runQuery(env, `${sql}${where} ORDER BY ${order}`, binds)
  if (!data.length) {
    return {status: 204}
  }

  return {data, status: 200}
}
