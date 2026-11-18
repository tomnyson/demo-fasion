import { CollectionBlock } from '@/components/home/CollectionBlock'
import { HeroSlider } from '@/components/home/HeroSlider'
import { SITE } from '@/config/site'
import { SLIDES } from '@/config/slides'

export default function Home() {
  return (
    <>
      <h1 className="sr-only">{`${SITE.name} – ${SITE.tagline}`}</h1>
      <HeroSlider slides={SLIDES} />
      <div id="san-pham" className="container-site scroll-mt-24">
        <CollectionBlock slug="noi-bat" />
        <CollectionBlock slug="best-seller" />
        <CollectionBlock slug="hang-moi" />
      </div>
    </>
  )
}
