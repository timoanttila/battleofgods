import {readable, writable} from 'svelte/store'
import type {Religion} from '$lib/types'

const local = (key, startValue) => {
  const {subscribe, set} = writable(startValue)

  return {
    subscribe,
    set,
    useLocalStorage: () => {
      const value = localStorage.getItem(key)
      try {
        JSON.parse(value)
        set(JSON.parse(value))
      } catch (e) {
        set(value)
      }

      subscribe(current => {
        if (typeof current === 'object' || Array.isArray(current)) {
          current = JSON.stringify(current)
        }

        localStorage.setItem(key, current)
      })
    }
  }
}

export const host = readable('https://battleofgods.net')
export const religion = writable<Religion | undefined>(undefined)
export const religions = writable<Religion[]>([])
export const siteName = readable('Battle of Gods')
export const user = local('user', null)
export const width = writable(0)

export const fetchData = async (query: string, method: string = 'GET', data: object | null = null) => {
  const url = `https://api.battleofgods.net/${query}`
  const headers = {
    'Content-Type': 'application/json',
    'Tuspe-Api': 'f5913925-a526-49f5-bcd9-351117375db3',
    'cache-control': 'max-age=21600'
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
