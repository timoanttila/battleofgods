import {fetchData} from '$lib/store'

export async function load({params}) {
  const religionSlug = params.religion
  const pageSlug = params.page
  return await fetchData(`religions/${religionSlug}/pages/${pageSlug}`)
}
