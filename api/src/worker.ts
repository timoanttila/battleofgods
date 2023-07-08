/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

interface Video {
  created: string
  id: number
  religion_id: number
  religion_sub_id?: number
  speakers: Speaker[]
  topics: Topic[]
  video_id: string
  video_image: string
  video_length: string
  video_title: string
  video_url: string
}

interface Speaker {
  id: number
  firstname: string
  lastname: string
}

interface Topic {
  id: number
  name: string
}

const query = 'SELECT videos.*, author_id, firstname, lastname, topic_id, topics.name topic_name FROM videos INNER JOIN religions ON videos.religion_id = religions.id LEFT JOIN video_topics ON videos.id = video_topics.video_id LEFT JOIN topics ON video_topics.topic_id = topics.id LEFT JOIN video_authors ON videos.id = video_authors.video_id LEFT JOIN authors ON video_authors.author_id = authors.id'

export interface Env {
  DB: D1Database
}

const handleResults = async (results: any): Promise<Video[]> => {
  if (!Array.isArray(results) || results.length === 0) {
    return []
  }

  const videos: Video[] = []
  const videoIds: number[] = []
  let authors: number[] = []
  let topics: number[] = []

  for (const v of results) {
    const {author_id, created, firstname, id, lastname, religion_branch_id, religion_id, topic_id, topic_name, video_id, video_length, video_start, video_title} = v

    if (!videoIds.includes(id)) {
      videoIds.push(id)
      authors = []
      topics = []

      let video_url = `https://www.youtube.com/watch?v=${video_id}`
      if (video_start) {
        video_url += `?start=${video_start}`
      }

      let video: Video = {
        created,
        id,
        religion_id,
        religion_sub_id: religion_branch_id ? religion_branch_id : undefined,
        speakers: [],
        topics: [],
        video_id,
        video_image: `https://img.youtube.com/vi_webp/${video_id}/mqdefault.webp`,
        video_length,
        video_title,
        video_url
      }

      videos.push(video)
    }

    const key = videos.findIndex(video => video.id === id)

    if (author_id && !authors.includes(author_id)) {
      authors.push(author_id)
      const speaker: Speaker = {
        id: author_id,
        firstname,
        lastname
      }

      videos[key].speakers.push(speaker)
    }

    if (topic_id && !topics.includes(topic_id)) {
      topics.push(topic_id)
      const topic: Topic = {
        id: topic_id,
        name: topic_name
      }

      videos[key].topics.push(topic)
    }
  }

  return videos
}

const fetchData = async (env: Env, table: string, order: string = 'name ASC') => {
  const {results} = await env.DB.prepare(`SELECT * FROM ${table} WHERE parent = '' ORDER BY ${order}`).all()
  return results
}

const queryCount = async (env: Env, table: string, where: string = '', binds: any[] | null = null, joins: string = ''): Promise<number> => {
  let sql = `SELECT videos.id FROM ${table}`
  if (joins) {
    sql += ` ${joins}`
  }
  if (where && binds) {
    sql += ` ${where}`
  }

  sql += ' GROUP BY videos.id'

  const statement = env.DB.prepare(sql)

  const {results} = where && binds ? await statement.bind(...binds).all() : await statement.all()
  return results?.length ?? 0
}

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

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)
    const pageSize = Number(url.searchParams.get('limit')) || 20
    const pageNumber = Number(url.searchParams.get('page')) || 1
    const offset = (pageNumber - 1) * pageSize
    const requests = url.pathname.split('/')

    let bind: string | number = '',
      binds = [],
      count = 0,
      field = 'id',
      id: number | string = 0,
      where = []

    if (!requests[1] || !['authors', 'religions', 'topics', 'videos'].includes(requests[1])) {
      return new Response(null, {status: 400})
    }

    switch (requests[1]) {
      case 'videos':
        let videos: Video[] = []

        if (requests.length === 3) {
          id = Number(requests[2])
          const {results} = await env.DB.prepare(`${query} WHERE video_topics.video_id = ? OR video_authors.video_id = ?`).bind(id, id).all()
          if (!results?.length) {
            return new Response(null, {status: 204})
          }

          videos = await handleResults(results)
          return Response.json(videos[0])
        }

        // Check if 'religion' parameter is missing
        if (!url.searchParams.get('religion')) {
          return new Response('Religion is required', {status: 400})
        }

        where.push('videos.religion_id = ?')
        binds.push(Number(url.searchParams.get('religion')))

        // Check if 'slug' parameter exists in the URL
        if (url.searchParams.get('slug')) {
          id = url.searchParams.get('slug') as string
          const {results} = await env.DB.prepare(`${query} WHERE videos.video_id = ?`).bind(id).all()

          // If no results found, return 204 No Content response
          if (!results?.length) {
            return new Response(null, {status: 204})
          }

          videos = await handleResults(results)
          return Response.json(videos[0]) // Return the first video as JSON
        }

        // Handle 'search' parameter
        if (url.searchParams.get('search')) {
          const keyword = url.searchParams
            .get('search')
            ?.replace(/[^a-z]/gi, '')
            .toLocaleLowerCase()

          if (keyword) {
            where.push('video_title LIKE ?')
            binds.push(`%${keyword}%`)
          }
        }

        // Handle 'speaker' parameter
        if (url.searchParams.get('speaker')) {
          where.push('video_authors.author_id = ?')
          binds.push(Number(url.searchParams.get('speaker')))
        }

        // Handle 'topic' parameter
        if (url.searchParams.get('topic')) {
          where.push('video_topics.topic_id = ?')
          binds.push(Number(url.searchParams.get('topic')))
        }

        const sqlWhere = where.length ? `WHERE ${where.join(' AND ')} ` : ''

        count = await queryCount(env, 'videos', sqlWhere, binds, 'LEFT JOIN video_authors ON video_authors.video_id = videos.id LEFT JOIN video_topics ON video_topics.video_id = videos.id')
        if (!count) {
          return new Response(null, {status: 204})
        }

        const {results} = await env.DB.prepare(`${query} ${sqlWhere} ORDER BY videos.created DESC LIMIT ${pageSize} OFFSET ${offset}`)
          .bind(...binds)
          .all()
        videos = await handleResults(results)

        return Response.json({
          data: videos,
          meta: await metaNumbers(count, pageNumber, pageSize)
        })

      case 'authors':
        const order = 'lastname, firstname ASC'

        if (requests.length === 3) {
          bind = Number(requests[2])
          if (!bind || bind === 0) {
            return new Response('Author ID is not valid.', {status: 400})
          }

          const {results} = await env.DB.prepare(`SELECT * FROM authors WHERE id = ? ORDER BY ${order}`).bind(bind).all()
          if (Array.isArray(results) && results.length) {
            return Response.json(results[0])
          }

          return new Response('Author not found.', {status: 404})
        } else if (url.searchParams.get('search')) {
          bind =
            url.searchParams
              .get('search')
              ?.replace(/[^a-z-]/gi, '')
              .toLocaleLowerCase() ?? ''

          if (!bind) {
            return new Response('Search keyword is not valid.', {status: 400})
          }

          bind = `%${bind}%`
          const {results} = await env.DB.prepare(`SELECT * FROM authors WHERE lastname LIKE ? OR firstname LIKE ? ORDER BY ${order}`).bind(bind, bind).all()
          if (Array.isArray(results) && results.length) {
            return Response.json(results)
          }

          return new Response(null, {status: 204})
        }

        return Response.json(await fetchData(env, 'authors', order))
      case 'religions':
        if (requests.length === 3) {
          bind = Number(requests[2])
          if (!bind || bind === 0) {
            return new Response('Religion ID is not valid.', {status: 400})
          }
        } else if (url.searchParams.get('slug')) {
          bind =
            url.searchParams
              .get('slug')
              ?.replace(/[^a-z]/gi, '')
              .toLocaleLowerCase() || ''

          if (!bind) {
            return new Response('Religion slug is not valid.', {status: 400})
          }

          field = 'slug'
        }

        if (bind) {
          const {results} = await env.DB.prepare(`SELECT * FROM religions WHERE ${field} = ? AND parent = ''`).bind(bind).all()
          if (Array.isArray(results) && results.length) {
            return Response.json(results[0])
          }

          return new Response('Religion not found.', {status: 404})
        }

        return Response.json(await fetchData(env, 'religions'))
      case 'topics':
        return Response.json(await fetchData(env, 'topics'))
    }
  }
}
