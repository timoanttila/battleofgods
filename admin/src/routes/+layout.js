import {runQuery} from '$lib/store'

export async function load() {
  return {
    religions: await runQuery('religions'),
    topics: await runQuery('topics')
  }
}
