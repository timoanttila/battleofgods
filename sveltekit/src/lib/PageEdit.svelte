<script lang="ts">
  import Editor from '@tinymce/tinymce-svelte';
  import { fetchData, user } from '$lib/store'
  import { browser } from '$app/environment';
	import { SvelteToast } from '@zerodevx/svelte-toast';
  import { toastMessage } from '$lib/toast'

  export let content: string
  export let id: number
  export let type: 'pages'|'religion' = 'pages'

  let body = content, edit = false, loading = false

  const updateArticle = () => {
    if (!$user?.sub || body.length || !id) {
      toastMessage('Missing information', 2)
    }

    loading = true

    fetchData(`/${type}/${id}`, 'PUT', {id, body, user: $user.sub}).then((result: any) => {
      if (result.message) {
        toastMessage(result.message, 2)
      } else if (result.error) {
        toastMessage(result.error, 2)
      }

      loading = false
    })
  }
</script>

{#if browser}
  <SvelteToast />
{/if}

<div id="improve" class="border-top mt-3">
  <div class="content gap grid mt-2 mx-auto">
    <div>
      <p>Is the article incomplete or misleading?<br>Help us improve this article.</p>
    </div>

    <div>
      {#if $user?.sub}
        <button on:click={() => edit = !edit} class="bg-primary btn p text-white">Edit page</button>
      {:else}
        <a class="bg-primary btn p text-white" href="/profile/login" rel="nofollow">Sign In</a>
      {/if}
    </div>
  </div>
</div>

{#if $user?.sub && edit}
  <div id="overlay" class="align-center flex">
    <div id="overlay-inner" class="bg-white mx-auto p-1 rounded">
      <Editor
        apiKey="dyqufq9qsq8xih8wock04xdi16c6u73370xlbbomblr4ysgm"
        channel="5"
        id="uuid"
        inline={false}
        disabled={false}
        modelEvents="input change undo redo"
        bind:value={body}
        text="readonly-text-output"
      />
      <div class="mt-1 text-right">
        <button on:click={() => updateArticle()} class="bg-primary btn p text-white" disabled={loading}>Save</button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss" scoped>
  #improve {
    .content {
      max-width: 695px;
    }
  }

  #overlay {
    background-color: rgba(0,0,0,0.6);
    height: 100vh;
    left: 0;
    position: fixed;
    top: 0;
    width: 100vw;
  }

  #overlay-inner {
    max-width: 1000px;
    width: 95vw;
  }

  @media screen and (min-width:800px) {
    #improve {
      .content {
        grid-template-columns: 1fr 1fr;

        div {
          &:first-child {
            text-align: right
          }

          &:last-child {
            align-items: center;
            display: flex;
            text-align: left;
          }
        }
      }
    }
  }

  @media screen and (max-width:800px) {
    #improve {
      text-align: center;
    }
  }
</style>