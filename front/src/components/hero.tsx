import {component$} from '@builder.io/qwik'

interface HeroProps {
  title: string
  image: string
  alt: string
}

export default component$<HeroProps>((props: HeroProps) => {
  return (
    <div id="hero" class="relative rounded text-center">
      <img id="hero-image" class="h-full object-cover w-full" src={`/images/${props.image}-1350.webp`} alt={props.alt} />
      <div id="hero-content" class="text-center text-white w-full">
        <h1 class="m-0">{props.title}</h1>
      </div>
    </div>
  )
})
