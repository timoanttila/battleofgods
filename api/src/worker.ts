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
  religion_sub?: string
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

const query = 'SELECT videos.*, religions.name religion_name, sub.name religion_sub, author_id, firstname, lastname, topic_id, topics.name topic_name FROM videos INNER JOIN religions ON videos.religion_id = religions.id LEFT JOIN religions sub ON videos.religion_branch_id = sub.id LEFT JOIN video_topics ON videos.id = video_topics.video_id LEFT JOIN topics ON video_topics.topic_id = topics.id LEFT JOIN video_authors ON videos.id = video_authors.video_id LEFT JOIN authors ON video_authors.author_id = authors.id WHERE'

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
    const {author_id, created, firstname, id, lastname, religion_branch_id, religion_id, religion_name, religion_sub, topic_id, topic_name, video_id, video_length, video_start, video_title} = v

    if (!videoIds.includes(id)) {
      videoIds.push(id)
      authors = []
      topics = []

      let video_url = `https://www.youtube.com/embed/${video_id}`
      if (video_start) {
        video_url += `?start=${video_start}`
      }

      let video: Video = {
        created,
        id,
        religion_id,
        religion_name,
        speakers: [],
        topics: [],
        video_id,
        video_image: `https://img.youtube.com/vi_webp/${video_id}/mqdefault.webp`,
        video_length,
        video_title,
        video_url
      }

      if (religion_branch_id && religion_branch_id !== religion_id) {
        video.religion_sub = religion_sub
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

const fetchVideos = async (where: string, id: number, env: Env) => {
  const {results} = await env.DB.prepare(`${query} ${where} = ? ORDER BY created DESC`).bind(id).all()
  return await handleResults(results)
}

const fetchData = async (table: string, env: Env) => {
  const {results} = await env.DB.prepare(`SELECT * FROM ${table} ORDER BY title_en ASC`).all()
  return results
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)

    const requests = url.pathname.split('/')
    switch (requests[1]) {
      case 'videos':
        const q = url.pathname.split('/')
        if (q.length === 3) {
          const id = Number(q[2])
          const {results} = await env.DB.prepare(`${query} video_topics.video_id = ?`).bind(id).bind(id).all()
          if (!results?.length) {
            return new Response('Video not found', {status: 404})
          }
          const videoArray = await handleResults(results)
          return Response.json(videoArray)
        }

        const name = url.searchParams.get('name')
        if (name) {
          const {results} = await env.DB.prepare(`${query} video_title LIKE ? ORDER BY created DESC`).bind(`%${name}%`).all()
          if (!results?.length) {
            return new Response('Video not found', {status: 404})
          }
          const videoArray = await handleResults(results)
          return Response.json(videoArray)
        }

        const religion = url.searchParams.get('religion')
        if (!religion || !Number(religion)) {
          return new Response('Religion not found', {status: 404})
        }

        const videos = await fetchVideos('videos.religion_id', Number(religion), env)
        return Response.json(videos)
      case 'authors':
        if (requests.length === 3) {
          const id = Number(requests[2])
          const videos = await fetchVideos('video_authors.author_id', id, env)
          return Response.json(videos)
        }

        return Response.json(await fetchData('authors', env))
      case 'religions':
        return Response.json(await fetchData('religions', env))
      case 'topics':
        if (requests.length === 3) {
          const id = Number(requests[2])
          const videos = await fetchVideos('video_topics.topic_id', id, env)
          return Response.json(videos)
        }

        return Response.json(await fetchData('topics', env))
    }
  }
}
