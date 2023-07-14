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

const getData = async (env: Env, select: string, binds: string[] | null = null) => {
  const statement = await env.DB.prepare(select)
  const {results} = binds ? await statement.bind(...binds).all() : await statement.all()

  if (Array.isArray(results)) {
    return results
  }
  return []
}

const fetchVideoExtras = async (env: Env, videoId: number) => {
  const tables = ['author', 'topic']
  const extras: {[key: string]: any} = {}

  for (const table of tables) {
    const data = await getData(env, `SELECT * FROM ${table}s t1 INNER JOIN video_${table}s t2 ON t2.${table}_id = t1.id WHERE t2.video_id = ?`, [videoId])
    if (Array.isArray(data) && data[0]) {
      extras[table] = data
    }
  }

  return extras
}

const queryCount = async (env: Env, table: string, where: string = '', binds: any[] | null = null): Promise<number> => {
  let sql = `SELECT COUNT(videos.id) total FROM ${table}`
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

const checkSlug = (value: string): string => {
  return value.toLowerCase().replace(/[^a-z0-9-]/gi, '')
}

const checkContent = (value: string): string => {
  return value.replace(/[^w\s@!.:;]/gi, '')
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
      results: any = null,
      religion: number | null = null,
      where: any[] = []

    if (!requests[1] || !['authors', 'pages', 'religions', 'topics', 'videos'].includes(requests[1])) {
      return new Response('This is not what you looking for..', {status: 400})
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {status: 200})
    }

    switch (requests[1]) {
      case 'pages':
        if (!url.searchParams.get('religion')) {
          return new Response('Religion is required.', {status: 400})
        }

        bind = Number(url.searchParams.get('religion'))
        if (!bind || bind < 1) {
          return new Response('Religion ID is not valid.', {status: 400})
        }

        let sql = 'SELECT * FROM pages WHERE religion_id = ?'
        binds.push(bind)

        if (url.searchParams.get('slug')) {
          bind = checkSlug(url.searchParams.get('slug'))
          sql += ' AND slug = ?'
          binds.push(bind)
          results = await getData(env, sql, binds)

          if (!results?.length) {
            return new Response('Page not found.', {status: 404})
          }

          return Response.json(results[0])
        }

        Response.json(await getData(env, `${sql} ORDER BY title ASC`))
      case 'videos':
        let videos: Video[] = []

        if (requests.length === 3) {
          bind = Number(requests[2])
          results = await getData(env, `${query} WHERE videos.id = ? LIMIT 1`, [bind])
          if (!results?.length) {
            return new Response('Video not found.', {status: 404})
          }

          const video = results[0] as Video
          const extras = await fetchVideoExtras(env, video.id)

          return Response.json(await handleVideoData({...video, ...extras}))
        }

        // Check if 'religion' parameter is missing
        if (!url.searchParams.get('religion')) {
          return new Response('Religion is required.', {status: 400})
        }

        bind = Number(url.searchParams.get('religion'))
        if (!bind || bind < 1) {
          return new Response('Religion ID is not valid.', {status: 400})
        }

        where.push('videos.religion_id = ? OR videos.religion_branch_id = ?')
        binds.push(bind, bind)

        if (url.searchParams.get('slug')) {
          bind = checkSlug(url.searchParams.get('slug'))
          results = await getData(env, `${query} WHERE videos.video_id = ? LIMIT 1`, [bind])
          if (!results?.length) {
            return new Response('Video not found.', {status: 404})
          }

          videos = await handleVideos(results)
          return Response.json(videos[0])
        }

        if (url.searchParams.get('search')) {
          bind = checkContent(url.searchParams.get('search'))
          if (bind) {
            where.push('video_title LIKE ?')
            binds.push(`%${id}%`)
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

        count = await queryCount(env, 'videos', sqlWhere, binds)
        if (!count) {
          return new Response(null, {status: 204})
        }

        results = await getData(env, `${query} ${sqlWhere} ORDER BY videos.created DESC LIMIT ${pageSize} OFFSET ${offset}`, binds)
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

          results = await getData(env, `SELECT * FROM authors WHERE id = ? LIMIT 1`, [bind])
          if (Array.isArray(results) && results.length) {
            return Response.json(results[0])
          }

          return new Response('Author not found.', {status: 404})
        } else if (url.searchParams.get('search')) {
          bind = checkContent(url.searchParams.get('search'))

          if (!bind) {
            return new Response('Search keyword is not valid.', {status: 400})
          }

          bind = `%${bind}%`
          results = await getData(env, `SELECT * FROM authors WHERE lastname LIKE ? OR firstname LIKE ? ORDER BY ${order}`, [bind, bind])

          if (Array.isArray(results) && results.length) {
            return Response.json(results)
          }

          return new Response(null, {status: 204})
        }

        return Response.json(await getData(env, `SELECT * FROM authors ORDER BY ${order}`))
      case 'religions':
        if (requests.length === 3) {
          bind = Number(requests[2])
          if (!bind || bind === 0) {
            return new Response('Religion ID is not valid.', {status: 400})
          }
        } else if (url.searchParams.get('slug')) {
          bind = checkSlug(url.searchParams.get('slug'))

          if (!bind) {
            return new Response('Religion slug is not valid.', {status: 400})
          }

          field = 'slug'
        }

        if (bind) {
          results = await getData(env, `SELECT * FROM religions WHERE ${field} = ? AND parent = '' LIMIT 1`, [bind])
          if (Array.isArray(results) && results.length) {
            return Response.json(results[0])
          }

          return new Response('Religion not found.', {status: 404})
        }

        return Response.json(await getData(env, `SELECT * FROM religions WHERE parent = '' ORDER BY id ASC`))
      case 'topics':
        return Response.json(await getData(env, 'SELECT * FROM topics ORDER BY name ASC'))
    }
  }
}
