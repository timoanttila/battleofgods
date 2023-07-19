import {runQuery, slugify} from './helpers'
import type {Env, Result} from './types'

interface Video {
  created: string
  id: number
  religion_id: number
  religion_name: string
  religion_sub_id?: number
  speakers?: Speaker[]
  topics?: FilterData[]
  video_id: string
  video_image: string
  video_length: string
  video_start?: string
  video_title: string
  video_url: string
}

interface Speaker {
  id: number
  firstname: string
  lastname: string
}

interface FilterData {
  id: number
  name: string
  slug?: string
}

/**
 * Returns an object containing limit and page values extracted from the given query parameters.
 * @param queryParams The URLSearchParams object containing the query parameters.
 * @returns An object with limit and page properties.
 */
const getMeta = (queryParams: URLSearchParams) => {
  return {
    limit: Number(queryParams.get('limit')) || 20,
    page: Number(queryParams.get('page')) || 1
  }
}

/**
 * Returns an object with count, limit, page, pages, next, and prev properties based on the given parameters.
 * @param count The total count of items.
 * @param page The current page number.
 * @param limit The limit of items per page.
 * @returns An object with count, limit, page, pages, next, and prev properties.
 */
const metaNumbers = async (count: number, page: number, limit: number) => {
  const pages = Math.ceil(count / limit)
  return {
    count,
    limit,
    page,
    pages,
    next: page < pages ? page + 1 : undefined,
    prev: page > 1 ? page - 1 : undefined
  }
}

/**
 * Runs a query and returns the count of results based on the given parameters.
 * @param env The environment object containing the database connection.
 * @param field The field to be counted.
 * @param query The SQL query.
 * @param binds Optional array of parameters to be bound to the query.
 * @returns A Promise that resolves to the count of results.
 */
const runQueryCount = async (env: Env, query: string, binds: any[] | null = null): Promise<number> => {
  const statement = env.DB.prepare(`SELECT COUNT(videos.id) total FROM videos ${query}`)
  const {results} = binds ? await statement.bind(...binds).all() : await statement.all()
  return (results[0] as any).total as number
}

/**
 * Modifies the given video object to include additional data and returns the updated video.
 * @param video The video object to be modified.
 * @returns The modified video object.
 */
const handleVideoData = (video: Video) => {
  const videoSlug = video.video_id
  let video_url = `https://www.youtube.com/watch?v=${videoSlug}`
  if (video.video_start) {
    video_url += `?start=${video.video_start}`
  }

  video.video_image = `https://img.youtube.com/vi_webp/${videoSlug}/mqdefault.webp`
  video.video_url = video_url

  return video
}

/**
 * Retrieves extra data related to the video based on the given videoId.
 * @param env The environment object containing the database connection.
 * @param videoId The ID of the video to retrieve extra data for.
 * @returns A Promise that resolves to an object containing extra data related to the video.
 */
const getExtras = async (env: Env, videoId: number) => {
  const tables = ['author', 'topic']
  const extras: {[key: string]: any} = {}

  for (const table of tables) {
    const data = await runQuery(env, `SELECT * FROM ${table}s t1 INNER JOIN video_${table}s t2 ON t2.${table}_id = t1.id WHERE t2.video_id = ?`, [videoId])
    if (Array.isArray(data) && data[0]) {
      extras[table] = data
    }
  }

  return extras
}

/**
 * Retrieves videos related to a specific religion based on the given requests and query parameters.
 * @param env The environment object containing the database connection.
 * @param requests The array of URL requests containing the religion and additional parameters.
 * @param queryParams The URLSearchParams object containing the query parameters.
 * @returns A Promise that resolves to a Result object with the list of videos and their metadata or an error response.
 */
export const getVideosByReligion = async (env: Env, requests: string[], queryParams: URLSearchParams): Promise<Result> => {
  let bind = ''
  let results: Video[] = []

  let query = 'SELECT videos.* FROM videos'

  if (results[4]) {
    bind = slugify(String(results[4]))
    results = await runQuery(env, `${query} WHERE videos.video_id = ? LIMIT 1`, [bind])
    if (!results.length) {
      return {data: 'Video not found.', status: 404}
    }

    const extras = await getExtras(env, Number(results[0].id))
    const data = handleVideoData({...results[0], ...extras})
    return {data, status: 200}
  }

  const binds: any[] = []
  const religion = slugify(requests[1])
  let where: string[] = []

  where.push('(videos.religion_id = ? OR videos.religion_branch_id = ?)')
  binds.push(religion, religion)

  if (queryParams.get('search')) {
    bind = slugify(String(queryParams.get('search')))
    where.push('video_title LIKE ?')
    binds.push(`%${bind}%`)
  }

  let joins = ''

  if (queryParams.get('speaker') && Number(queryParams.get('speaker')) > 0) {
    joins = ' INNER JOIN video_authors ON videos.id = video_authors.video_id'
    where.push('video_authors.author_id = ?')
    binds.push(Number(queryParams.get('speaker')))
  }

  if (queryParams.get('topic') && Number(queryParams.get('topic')) > 0) {
    joins += ' INNER JOIN video_topics ON videos.id = video_topics.video_id'
    where.push('video_topics.topic_id = ?')
    binds.push(Number(queryParams.get('topic')))
  }

  const sqlWhere = where.length ? `WHERE ${where.join(' AND ')} ` : ''

  const count = await runQueryCount(env, `${joins} ${sqlWhere}`, binds)
  if (!count) {
    return {data: {data: [], meta: {count: 0}}, status: 200}
  }

  const sort = getMeta(queryParams)

  try {
    results = await runQuery(env, `${query}${joins} ${sqlWhere} ORDER BY videos.created DESC LIMIT ${sort.limit} OFFSET ${sort.limit * (sort.page - 1)}`, binds)

    let data: Video[] = []
    results.forEach(video => {
      data.push(handleVideoData(video))
    })

    const meta = await metaNumbers(count, sort.page, sort.limit)
    return {data: {data, meta}, status: 200}
  } catch (error) {
    console.error('Error while fetching videos:', error)
    return {data: 'Error occurred while fetching videos.', status: 500}
  }
}
