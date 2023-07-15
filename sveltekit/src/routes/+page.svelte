<script lang="ts">
  import {religions} from '$lib/store'
  import Hero from '$lib/Hero.svelte'
</script>

<Hero
	alt="A monk sits atop a large rock, looking out at the majestic castle in the distance. The sky is filled with white clouds and a flock of birds flying by."
	description="Discovering the true path amidst diverse religions can be challenging. Join us in exploring faiths, teachings, and historical truths to navigate this spiritual quest with enlightenment."
	image="battle-of-gods"
	title="Battle of Gods"
/>

<div id="about" class="mb-3 mt-3 mx-auto px text-center">There are many religions in the world, but what is the truth? Who holds the answers? What does history reveal? Welcome to the theological teachings of the world's largest religions, incredible discoveries and great insights. Let us help you discover the path to enlightenment!</div>

<div id="religions" class="gap grid no-underline">
{#each $religions as religion}
	<div id={`religion-${religion.slug}`} class="grid grid-2 religion-content">
		<div class="religion-image">
			<img
				id={`religion-${religion.id}-image`}
				class="block h-full object-cover w-full"
				src={`/images/${religion.slug}-635.webp`}
				alt={`Religion: ${religion.name}`}
				width="635"
				height="400"
				decoding="async" loading="lazy"
			/>
		</div>

		<div class="align-center flex religion-info">
			<div>
				<h2 class="leading-tight m-0">{religion.name}</h2>
				<div class="leading religion-summary">{religion.summary}</div>
				<div>
					<a
						class="btn leading-tight rounded"
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

	a:hover {
		background-color: var(--black);
		color: var(--white);
	}

  h2 {
    font-size: 2.2rem;
    line-height: 1.2;
  }
}

.religion-image {
  min-height: 400px;
}

.religion-summary {
  margin: 1rem auto 1.5rem;
}

@media screen and (min-width:1000px) {
	#religions {
		margin: 0 1.5rem;

		a:not(:hover) {
			background-color: var(--white);
			color: var(--primary);
		}

		h2 {
			color: var(--white);
		}
	}

	.religion-content {
		background: radial-gradient(79.69% 102.24% at 100% 100.11%, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)), radial-gradient(89.7% 115.09% at 3.43% 2.75%, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0)), #764ABC;
		background-blend-mode: overlay, overlay, normal;
		box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
		padding: 1.5rem;
		gap: 2rem;
	}

	.religion-content,
	.religion-image {
		border-radius: 20px;
		overflow: hidden;
	}

	.religion-summary {
		color: var(--light);
	}
}

	@media screen and (max-width:1000px) {
		.religion-content {
			gap: 1.5rem;

			a:not(:hover) {
				background-color: var(--primary);
				color: var(--white);
			}

			h2 {
				color: var(--primary);
			}
		}

		.religion-image {
			height: 400px;
		}

		.religion-info {
			padding: 0 1rem;
		}

		.religion-summary {
			color: var(--black);
		}
	}
</style>
