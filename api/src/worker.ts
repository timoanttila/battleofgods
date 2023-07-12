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

const query = 'SELECT videos.*, religions.name religion_name FROM videos INNER JOIN religions ON videos.religion_id = religions.id'
/*
const query = 'SELECT videos.*, author_id, firstname, lastname, topic_id, topics.name topic_name, religions.name religion_name FROM videos INNER JOIN religions ON videos.religion_id = religions.id LEFT JOIN video_topics ON videos.id = video_topics.video_id LEFT JOIN topics ON video_topics.topic_id = topics.id LEFT JOIN video_authors ON videos.id = video_authors.video_id LEFT JOIN authors ON video_authors.author_id = authors.id'
*/
export interface Env {
  DB: D1Database
}

const handleVideoData = async (video: Video): Promise<Video> => {
  const videoSlug = video.video_id
  let video_url = `https://www.youtube.com/watch?v=${videoSlug}`
  if (video.video_start) {
    video_url += `?start=${video.video_start}`
  }

  video.video_image = `https://img.youtube.com/vi_webp/${videoSlug}/mqdefault.webp`
  video.video_url = video_url

  return video
}

const handleVideos = async (results: any): Promise<Video[]> => {
  const videos: Video[] = []

  for (const v of results) {
    videos.push(await handleVideoData(v))
  }

  return videos
}

const fetchData = async (env: Env, table: string, order: string = 'name ASC') => {
  const {results} = await env.DB.prepare(`SELECT * FROM ${table} WHERE parent = '' ORDER BY ${order}`).all()
  return results
}

const fetchVideoExtras = async (env: Env, videoId: number) => {
  const tables = ['author', 'topic']
  const extras: {[key: string]: any} = {}

  for (const table of tables) {
    const data = await env.DB.prepare(`SELECT * FROM ${table}s t1 INNER JOIN video_${table}s t2 ON t2.${table}_id = t1.id WHERE t2.video_id = ?`).bind(videoId).all()
    if (Array.isArray(data.results) && data.results[0]) {
      extras[table] = data.results
    }
  }

  return extras
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
      binds: any[] = [],
      count = 0,
      field = 'id',
      id: number | string = 0,
      where: any[] = []

    if (!requests[1] || !['authors', 'religions', 'topics', 'videos'].includes(requests[1])) {
      return new Response(null, {status: 400})
    }

    switch (requests[1]) {
      case 'videos':
        let videos: Video[] = []

        if (requests.length === 3) {
          id = Number(requests[2])
          const {results} = await env.DB.prepare(`${query} WHERE videos.id = ? LIMIT 1`).bind(id).all()
          if (!results?.length) {
            return new Response(null, {status: 204})
          }

          const video = results[0] as Video
          const extras = await fetchVideoExtras(env, video.id)

          return Response.json(await handleVideoData({...video, ...extras}))
        }

        // Check if 'religion' parameter is missing
        if (!url.searchParams.get('religion')) {
          return new Response('Religion is required', {status: 400})
        }

        const religion: string | number = url.searchParams.get('religion') ?? ''
        where.push(Number.isNaN(religion) ? 'videos.religion_id = ?' : 'religions.slug = ?')
        binds.push(religion)

        // Check if 'slug' parameter exists in the URL
        if (url.searchParams.get('slug')) {
          id = url.searchParams.get('slug') as string
          const {results} = await env.DB.prepare(`${query} WHERE videos.video_id = ?`).bind(id).all()

          // If no results found, return 204 No Content response
          if (!results?.length) {
            return new Response(null, {status: 204})
          }

          videos = await handleVideos(results)
          return Response.json(videos[0])
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
        if (url.searchParams.get('speaker') && Number(url.searchParams.get('speaker')) > 0) {
          where.push('video_authors.author_id = ?')
          binds.push(Number(url.searchParams.get('speaker')))
        }

        // Handle 'topic' parameter
        if (url.searchParams.get('topic') && Number(url.searchParams.get('topic')) > 0) {
          where.push('video_topics.topic_id = ?')
          binds.push(Number(url.searchParams.get('topic')))
        }

        const sqlWhere = where.length ? `WHERE ${where.join(' AND ')} ` : ''

        count = await queryCount(env, 'videos', sqlWhere, binds, 'INNER JOIN religions ON religions.id = videos.religion_id LEFT JOIN video_authors ON video_authors.video_id = videos.id LEFT JOIN video_topics ON video_topics.video_id = videos.id')
        if (!count) {
          return new Response(null, {status: 204})
        }

        const {results} = await env.DB.prepare(`${query} ${sqlWhere} ORDER BY videos.created DESC LIMIT ${pageSize} OFFSET ${offset}`)
          .bind(...binds)
          .all()
        videos = await handleVideos(results)

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
