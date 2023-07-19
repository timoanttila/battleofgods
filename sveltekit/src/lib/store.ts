import {readable, writable} from 'svelte/store'
import type {Filter, HeroData, Religion} from '$lib/types'

const local = (key: string, startValue: any) => {
  const {subscribe, set} = writable(startValue)

  return {
    subscribe,
    set,
    useLocalStorage: () => {
      const value: string = String(localStorage.getItem(key))
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

export const hero = writable<HeroData | undefined>()
export const host = readable('https://battleofgods.net')
export const religion = writable<Religion | undefined>()
export const religions = writable<Religion[]>([])
export const siteName = readable('Battle of Gods')
export const topic = writable(0)
export const topics = writable<Filter[] | undefined>()
export const user = local('user', null)
export const width = writable(0)

export const heroDefault = readable<HeroData>({
  alt: 'A monk sits atop a large rock, looking out at the majestic castle in the distance. The sky is filled with white clouds and a flock of birds flying by.',
  image: 'battle-of-gods',
  description: 'There are many religions in the world, but which one is the real truth? Join us in exploring religions, teachings and historical findings to find the truth and your own path.',
  title: 'Battle of Gods'
})

export const fetchData = async (query: string, method: string = 'GET', data: object | null = null, key: string | null = null) => {
  if (key) {
    const token = localStorage.getItem(`${key}.accessToken`)
    if (token) {
      key = token
    } else {
      return {error: 'Token is not valid.'}
    }
  }

  const url = `https://api.battleofgods.net/${query}`
  const headers = {
    'Content-Type': 'application/json',
    'Tuspe-Api': 'f5913925-a526-49f5-bcd9-351117375db3',
    'cache-control': 'max-age=21600',
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
