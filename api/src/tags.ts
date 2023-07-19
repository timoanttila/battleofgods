import {runQuery, slugify} from './helpers'
import type {Env, Result} from './types'

interface Topic {
  id: string | number
  name: string
}

/**
 * Retrieves all topics from the database.
 * @param env The environment object containing the database connection.
 * @returns A Promise that resolves to a Result object with the list of topics or null if no data is found.
 */
export const getTopics = async (env: Env) => {
  const data: Topic[] = await runQuery(env, 'SELECT * FROM topics ORDER BY name ASC')
  return {data: data ?? null, status: data ? 200 : 204}
}

/**
 * Retrieves topics related to a specific religion based on the given requests.
 * @param env The environment object containing the database connection.
 * @param requests The array of URL requests containing the religion and type of topics.
 * @returns A Promise that resolves to a Result object with the list of topics and their counts or an error response.
 */
export const getTopicsByReligion = async (env: Env, requests: string[]): Promise<Result> => {
  const religion = slugify(requests[1])
  const type = slugify(requests[3])

  let join = ''

  if (type === 'videos') {
    join = 'INNER JOIN video_topics ON topics.id = video_topics.topic_id INNER JOIN videos ON videos.id = video_topics.video_id'
  } else if (type === 'pages') {
    join = 'INNER JOIN pages ON topics.id = pages.topic_id'
  } else {
    return new Response(`Type is not valid: ${type}`, {status: 400})
  }

  const data: any[] = await runQuery(env, `SELECT topics.id, topics.name, COUNT(${type}.id) total FROM topics ${join} WHERE ${type}.religion_id = ? GROUP BY topics.id ORDER BY topics.name ASC`, [religion])

  if (!data.length) {
    return {status: 204}
  }

  return {data, status: 200}
}
