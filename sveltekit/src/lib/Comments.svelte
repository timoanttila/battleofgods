<script lang="ts">
  import dayjs from 'dayjs';
  import { fetchData, user } from '$lib/store';
  import { toastMessage } from '$lib/toast'
  import type { ResultData, VideoMeta } from '$lib/types';

  interface Comment {
    created: string;
    creator_name: string;
    creator: number;
    formattedDate: string;
    id: number;
    message: string;
  }

  interface CommentData {
    data: Comment[];
    meta: VideoMeta;
  }

  export let id: number;

  let comments: Comment[] = [], meta: VideoMeta|null = null, query = `comments/${id}`

  const getComments = () => {
    comments = [];
    fetchData(query).then((result: CommentData) => {
      if (!result?.meta) {
        return
      }

      meta = result.meta

      if (result.meta.count) {
        comments = result.data.map(comment => ({
          ...comment,
          formattedDate: dayjs(comment.created).format('DD.MM.YYYY')
        }));
      }
    });
  };

  $: if (id) {
    query = `comments/${id}`
    getComments()
  }

  let message = ''

  const newComment = () => {
    fetchData(query, 'POST', {page_id: id, user_id: $user.sub, message}).then((result: ResultData) => {
      if (result?.message) {
        toastMessage(result.message, 1)
      } else if (result?.error) {
        toastMessage(result.error, 2)
      } else {
        toastMessage('Unfortunately, sending a comment was not successful.', 2)
      }
    })
  }
</script>

<div class="border-top mt-2">
  <h2 class="mb-2 mt-2">Comments</h2>

  {#if meta}
    <div id="comments-count">
      {#if meta.count}
        The article has {meta.count} comment(s).
      {:else}
        <p>Be the first to comment on the article.</p>
      {/if}
    </div>
  {/if}

  <details>
    <summary>Leave a comment</summary>
    <form on:submit|preventDefault={() => newComment()} class="content mt-1">
      <div class="input">
        <textarea id="comment-message" bind:value={message} minlength="10" maxlength="1000" required></textarea>
        <label for="comment-message">Message</label>
      </div>

      <div class="form-actions mt-1 text-right">
        <button class="bg-primary btn p text-white" type="submit">Send</button>
      </div>
    </form>
  </details>

  {#if comments && comments.length}
    <div id="comments">
      {#each comments as comment}
        <div class="comment">
          <header>
            <span class="block">{comment.creator_name}</span>
            <time class="block" datetime={comment.created}>{comment.formattedDate}</time>
          </header>
          <div class="comment-content">{comment.message}</div>
        </div>
      {/each}
    </div>
  {/if}
</div>