import { CollectionBlock } from '@/components/home/CollectionBlock'
import { HeroSlider } from '@/components/home/HeroSlider'
import { SLIDES } from '@/config/slides'

export default function Home() {
  return (
    <>
      <HeroSlider slides={SLIDES} />
      <div id="san-pham" className="container-site scroll-mt-24">
        <CollectionBlock slug="noi-bat" />
        <CollectionBlock slug="best-seller" />
        <CollectionBlock slug="hang-moi" />
      </div>
    </>
  )
}
