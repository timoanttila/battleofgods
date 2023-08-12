import {readable, writable} from 'svelte/store'
import type {Religion} from '$lib/types'

export const religions = writable<Religion[] | null>(null)
export const topics = writable(null)

export const api = 'https://api.battleofgods.net/'
export const menu = [
  {link: '/', title: 'Home'},
  {link: '/religions', title: 'Religions'},
  {link: '/pages', title: 'Pages'},
  {link: '/topics', title: 'Topics'},
  {link: '/videos', title: 'Videos'}
]

export const slugify = (value: string): string => {
  return value.toLowerCase().replace(/[^a-z0-9-]/gi, '')
}

export const runQuery = async (query: string, method: 'GET' | 'POST' = 'GET', data: object | null = null, key: boolean = false) => {
  if (key) {
    const token = localStorage.getItem(`${key}.accessToken`)
    if (token) {
      key = token
    } else {
      return {error: 'Token is not valid.'}
    }
  }

  const url = `${api}${query}`
  const headers = {
    'Content-Type': 'application/json',
    'cache-control': 'max-age=120',
    ...(key ? {Authorization: `Bearer ${key}`} : undefined)
  }

  const options: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  }

  try {
    const response = await fetch(url, options)
    if (response.status === 429) {
      return {error: 'Too many requests'}
    }
    return await response.json()
  } catch (err) {
    return err
  }
}
