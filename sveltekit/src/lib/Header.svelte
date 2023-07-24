<script lang="ts">
  import {page} from '$app/stores'
  import {religions, siteName, user, width} from '$lib/store'

  let menu: boolean = $width > 750 ? true : false
  let profileLink = '/profile'
  if (!$user?.sub) {
    profileLink += '/login'
  }
</script>

<header id="head" class="no-underline relative">
  <div id="site-brand" class="align-center flex">
    <a class="inline-block leading-tight text-primary" href="/" rel="home" title="Back to front page">
      <strong>{$siteName}</strong>
    </a>
  </div>

  <button on:click={() => (menu = !menu)} aria-controls="menu" aria-haspopup="true" aria-expanded={menu} disabled={$width > 750}>
    <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>Menu</title>
      <path d="m11 16.745c0-.414.336-.75.75-.75h9.5c.414 0 .75.336.75.75s-.336.75-.75.75h-9.5c-.414 0-.75-.336-.75-.75zm-9-5c0-.414.336-.75.75-.75h18.5c.414 0 .75.336.75.75s-.336.75-.75.75h-18.5c-.414 0-.75-.336-.75-.75zm4-5c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75z" fill-rule="nonzero" />
    </svg>
  </button>

  <nav id="menu" class:active={menu}>
    <ul class="leading-tight m-0 p-0">
      {#each $religions as religion}
        <li class="inline-block">
          <a class="block" href={`/${religion.slug}`} on:click={() => (menu = false)} title={`What is ${religion.name}?`} class:active={$page.params?.religion === religion.slug}><strong>{religion.name}</strong></a>
        </li>
      {/each}

      <li class="inline-block">
        <a class="block" href={profileLink} on:click={() => (menu = false)} title="User profile"><strong>{$user?.sub ? 'Profile' : 'Sign In'}</strong></a>
      </li>
    </ul>
  </nav>
</header>
