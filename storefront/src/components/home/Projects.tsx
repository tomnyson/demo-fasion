import Image from 'next/image'
import { SectionHead } from '@/components/ui/SectionHead'
import { PROJECT_IMAGES } from '@/config/demo-images'

const PROJECTS = [
  { title: 'Đồng phục đội bóng', image: PROJECT_IMAGES.team },
  { title: 'Đồng phục trường lớp', image: PROJECT_IMAGES.school },
  { title: 'Đồng phục công ty', image: PROJECT_IMAGES.company },
] as const

export function Projects() {
  return (
    <section className="bg-brand py-14 text-white">
      <div className="container-site">
        <SectionHead kicker="Dự án thực tế" title="NHỮNG BỘ ĐỒNG PHỤC CHÚNG TÔI ĐÃ THỰC HIỆN" />
        <ul className="mt-8 grid gap-4 min-[850px]:grid-cols-3">
          {PROJECTS.map((project) => (
            <li key={project.title} className="overflow-hidden rounded-card bg-white text-ink shadow-card">
              <div className="relative aspect-[4/3]">
                <Image src={project.image} alt="" fill sizes="(max-width: 849px) 100vw, 380px" className="object-cover" />
              </div>
              <h3 className="p-4 text-lg font-bold">{project.title}</h3>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
