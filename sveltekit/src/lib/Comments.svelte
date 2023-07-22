<script lang="ts">
  import dayjs from 'dayjs'
  import {fetchData, user} from '$lib/store'
  import {toastMessage} from '$lib/toast'
  import type {ResultData, VideoMeta} from '$lib/types'

  interface Comment {
    created: string
    userName: string
    creator: number
    formattedDate: string
    id: number
    content: string
  }

  interface CommentData {
    data: Comment[]
    meta: VideoMeta
  }

  export let id: number

  $: comments = <Comment[]>[]
  let query = `comments/${id}`

  const getComments = () => {
    comments = []
    fetchData(query).then((result: Comment[]) => {
      if (Array.isArray(result) && result.length) {
        comments = result
      }
    })
  }

  $: if (id) {
    query = `pages/${id}/comments`
    getComments()
  }

  let content = '',
    loading = false

  const newComment = () => {
    if ($user === null) {
      toastMessage('You must be logged in to comment.', 2)
      return
    }

    if (!content.length) {
      toastMessage('Please enter a message.', 2)
      return
    }

    loading = true

    fetchData(query, 'POST', {pageId: id, userId: $user.sub, userName: $user.nickname, content}, $user.key)
      .then((result: ResultData) => {
        if (result?.message) {
          toastMessage(result.message, 1)
        } else if (result?.error) {
          toastMessage(result.error, 2)
          getComments()
        } else {
          toastMessage('Unfortunately, sending a comment was not successful.', 2)
        }
      })
      .finally(() => {
        loading = false
      })
  }
</script>

{#if $user?.sub}
  <div class="border-top mt-2">
    <h2 class="mb-0 mt-2">Comments</h2>

    {#if Array.isArray(comments)}
      <div id="comments-count">
        {#if comments.length}
          The article has {comments.length} comment(s).
        {:else}
          <p>Be the first to comment on the article.</p>
        {/if}
      </div>
    {/if}

    <details class="mb-2 mt-1">
      <summary>Leave a comment</summary>
      <form on:submit|preventDefault={() => newComment()} class="content mt-1">
        <div class="input">
          <textarea id="comment-message" bind:value={content} minlength="10" maxlength="1000" required />
          <label for="comment-message">Message</label>
        </div>

        <div class="flex form-actions mt-1 justify-between text-right">
          <button on:click|preventDefault={() => (content = '')} class="bg-black" type="submit">Send</button>
          <button class="bg-green" type="submit" disabled={!$user || loading}>Send</button>
        </div>
      </form>
    </details>

    {#if Array.isArray(comments) && comments.length}
      <div id="comments">
        {#each comments as comment}
          <div class="comment">
            <div class="comment-content">{comment.content}</div>
            <div class="comment-info flex justify-between">
              <span class="block">{comment.userName}</span>
              <time class="block" datetime={comment.created}>{dayjs(comment.created).format('DD.MM.YYYY')}</time>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style lang="scss" scoped>
  .comment {
    border: 1px solid var(--border-light);

    .comment-content,
    .comment-info {
      padding: 1rem;
    }

    .comment-info {
      border-top: 1px solid var(--border-light);
    }
  }
</style>
