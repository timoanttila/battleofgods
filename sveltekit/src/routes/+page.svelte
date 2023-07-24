<script lang="ts">
  import {hero, heroDefault, religions} from '$lib/store'
  $hero = {...$heroDefault, pages: undefined}
</script>

<div id="about" class="mb-3 mt-2 mx-auto px text-center">There are many religions in the world, but what is the truth? Who holds the answers? What does history reveal? Let's look for answers together and get to know the teachings, experiences, and historical evidence of the world's largest religions. Open your mind to incredible discoveries and great insights.</div>

<div id="religions" class="gap grid">
  {#each $religions as religion}
    <div id={`religion-${religion.slug}`} class="grid grid-2 religion-content">
      <div class="religion-image">
        <img id={`religion-${religion.id}-image`} class="block h-full object-cover w-full" src={`/images/${religion.slug}-635.webp`} alt={`Religion: ${religion.name}`} width="635" height="400" decoding="async" loading="lazy" />
      </div>

      <div class="align-center flex religion-info">
        <div>
          <h2 class="leading-tight m-0">{religion.name}</h2>
          <div class="leading religion-summary">{religion.summary}</div>
          <div>
            <a class="bg-blue" href={`/${religion.slug}`} title={`What is religion ${religion.name}?`}>Read more &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>
