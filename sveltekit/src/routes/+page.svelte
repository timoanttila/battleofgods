<script lang="ts">
  import {religions} from '$lib/store'
  import Hero from '$lib/Hero.svelte'
</script>

<Hero
	alt="A monk sits atop a large rock, looking out at the majestic castle in the distance. The sky is filled with white clouds and a flock of birds flying by."
	image="battle-of-gods"
	title="Battle of Gods"
/>

<div id="about" class="mb-3 mt-3 mx-auto text-center">There are many religions in the world, so how can we know which religion is the right one and which one is meant for you? Battle of Gods provides an opportunity to explore the world's largest religions and watch videos from priests and ordinary people. Join us to discover the wonders, historical truths, and theology of religions.</div>

<div id="religions" class="gap grid no-underline">
{#each $religions as religion}
	<div id={`religion-${religion.slug}`} class="grid grid-2 religion-content rounded">
		<div class="religion-image">
			<img
				id={`religion-${religion.id}-image`}
				class="block h-full object-cover rounded w-full"
				src={`/images/${religion.slug}-635.webp`}
				alt={`Religion: ${religion.name}`}
				width="635"
				height="400"
				decoding="async" loading="lazy"
			/>
		</div>

		<div class="align-center flex">
			<div>
				<h2 class="leading-tight m-0 text-white">{religion.name}</h2>
				<div class="leading religion-summary text-light">{religion.summary}</div>
				<div>
					<a
						class="bg-white btn leading-tight rounded text-primary"
						href={`/${religion.slug}/`}
						title={`What is religion ${religion.name}?`}
					>
						Read more &rarr;
					</a>
				</div>
			</div>
		</div>
	</div>
{/each}
</div>

<style lang="scss" scoped>
#religions {
	.btn {
		padding: 0.5rem 2rem;
	}

  h2 {
    font-size: 2.2rem;
    line-height: 1.2;
  }

  .religion-content {
    background: radial-gradient(79.69% 102.24% at 100% 100.11%, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)), radial-gradient(89.7% 115.09% at 3.43% 2.75%, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0)), #764ABC;
    background-blend-mode: overlay, overlay, normal;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
    padding: 1.5rem;
    gap: 2rem;
  }

  .religion-image {
    min-height: 400px;
  }

  .religion-summary {
    margin: 1rem auto 1.5rem;
  }
}
</style>
