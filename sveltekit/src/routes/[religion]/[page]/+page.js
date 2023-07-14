import {fetchData, religion} from '$lib/store'

export async function load({ params }) {
  const param = params.page
  const page = await fetchData(`pages?religion=${$religion.slug}&slug=${param}`)
  return {
      post: page?.id ? page : {
          title: `This is not the way..`,
          content: `You have failed to fullfill your duties.`
      }
  };
}