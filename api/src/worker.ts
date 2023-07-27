import {addComment, getComments} from './comments'
import {getPageById, getPagesByReligion, getReligions, pageUpdate} from './pages'
import {getVideosByReligion} from './videos'
import {getTopics, getTopicsByReligion} from './tags'
import {slugify} from './helpers'
import type {Env, Result} from './types'

export default {
  async fetch(request: Request, env: Env) {
    const cors = new Headers()
    cors.set('Content-Type', 'application/json;charset=UTF-8')
    cors.set('Access-Control-Allow-Origin', '*')
    cors.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
    cors.set('Access-Control-Allow-Headers', 'Authorization, Cache-Control, Content-Type, Keep-Alive, Origin, Tuspe-Api, Upgrade-Insecure-Requests, User-Agent, X-Requested-With')
    cors.set('Access-Control-Allow-Credentials', 'true')
    cors.set('Access-Control-Max-Age', '21600')
    cors.set('X-Robots-Tag', 'noindex, nofollow')

    const headers = {
      status: 200,
      headers: cors
    }

    if (request.method === 'OPTIONS') {
      headers.status = 204
      return new Response(null, headers)
    }

    const url = new URL(request.url)
    let requests: any = url.pathname.split('/')

    requests.shift()
    const count = requests.length
    const method = request.method.toLowerCase()

    let body
    if (['post', 'put'].includes(method)) {
      body = await request.text()
      if (!body) {
        return new Response('POST and PUT requests must have a body.', {status: 400})
      }

      body = JSON.parse(body)
    }

    let results: Result | null = null
    requests[0] = slugify(requests[0])

    if (method === 'put') {
      if (!['pages', 'religions'].includes(requests[0])) {
        return new Response(null, {status: 405})
      }

      results = await getPageById(env, requests)
      if (results.status !== 200) {
        return new Response('Page not found.', {status: 404})
      }

      results = await pageUpdate(env, requests[0], String(results.data.id), body)
      return new Response(JSON.stringify(results.data), {...headers, status: results.status})
    }

    let pageId: string | number | null = null
    if (count > 1) {
      pageId = slugify(requests[1])
    }

    if (!['get', 'post'].includes(method)) {
      return new Response(null, {status: 405})
    }

    switch (requests[0]) {
      case 'pages':
        if (pageId) {
          if (count === 3) {
            if (method === 'post') {
              results = await addComment(env, String(pageId), body)
            } else {
              results = await getComments(env, String(pageId))
            }
          } else {
            results = await getPageById(env, requests)
          }
        }
        break
      case 'religions':
        /**
         * GET /religions
         * GET /religions/:religion
         * GET /religions/:religion/:type
         * GET /religions/:religion/:type/:id
         * religions/1/videos/topics
         */
        if (method !== 'get') {
          return new Response(null, {status: 405})
        }

        if (count >= 3) {
          switch (slugify(requests[2])) {
            case 'pages':
              results = await getPagesByReligion(env, requests, url.searchParams)
              break
            case 'topics':
              if (count !== 4) {
                return new Response('Topic type is required.', {status: 400})
              }

              results = await getTopicsByReligion(env, requests)
              break
            case 'videos':
              results = await getVideosByReligion(env, requests, url.searchParams)
              break
            default:
              return new Response(null, {status: 400})
          }
          break
        }

        results = await getReligions(env, pageId)
        break
      case 'topics':
        results = await getTopics(env)
        break
      default:
        return new Response(null, {status: 400})
    }

    if (results?.status) {
      if (results.status !== 204 && typeof results.data === 'string') {
        results.data = {error: results.data}
      }
      return new Response(results.status === 204 ? null : JSON.stringify(results.data), {...headers, status: results.status})
    }

    return new Response('This is not what you looking for..', {status: 400})
  }
}
