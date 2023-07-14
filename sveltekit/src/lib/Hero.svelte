<script lang="ts">
  export let alt: string
  export let image: string
  export let title: string

	$: imageUrl = `/images/${image}`
</script>

<div id="hero" class="relative text-center">
	<img
		id="hero-image"
		class="block h-auto w-full"
		srcset={`${imageUrl}-400.webp 400w, ${imageUrl}-635.webp 635w, ${imageUrl}-1350.webp 1350w`}
		sizes="(max-width: 500px) 400px, (max-width: 768px) 635px, 1350px"
		src={`${imageUrl}-1350.webp`}
		{alt}
		width="1350"
		height="500"
		decoding="async"
		aria-hidden="true"
	/>
	<div id="hero-content" class="absolute bottom-6 left-0 text-white w-full">
		<h1 class="leading-tight m-0 mx-auto">{title}</h1>
	</div>
</div>