import Image from 'next/image';
import LinkButton from '@/components/LinkButton';
import { type Locale } from '@/lib/config';
import { type StrictTranslations } from '@/lib/localizer';

const PROJECT_SLUGS = ['mixed-reality', 'portfolio-site'] as const;

const PROJECT_ASSETS: Record<typeof PROJECT_SLUGS[number], string | null> = {
  'mixed-reality': '/mixed-reality/ARPrevious.jpg',
  'portfolio-site': null, 
};

const TRANSLATIONS = {
  en: {
    heading: "Projects",
    projectImageLabel: "Project image",
    viewProject: "View project",
    underConstruction: "Under construction",
    projects: {
      'mixed-reality': {
        title: 'Mixed reality without specialized hardware',
        lesson:
          'A project that kept growing in scope and features, while the code became increasingly simpler, cleaner, and more organized. From 1,000 to 2,200 lines, but with far more functionality.',
      },
      'portfolio-site': {
        title: 'Professional Portfolio Website',
        lesson:
          'From zero experience with Next.js, TypeScript, and AWS to production in just one month. From design and development to infrastructure and deployment.',
      },
    },
  },
  es: {
    heading: "Proyectos",
    projectImageLabel: "Imagen del proyecto",
    viewProject: "Ver proyecto",
    underConstruction: "En construcción",
    projects: {
      'mixed-reality': {
        title: 'Realidad mixta sin hardware especializado',
        lesson:
          'Un proyecto que siguió creciendo en alcance y características, mientras que el código se volvía cada vez más simple, limpio y organizado. De 1.000 a 2.200 líneas, pero con infinitas mas funcionalidades.',
      },
      'portfolio-site': {
        title: 'Portafolio web profesional',
        lesson:
          'De cero experiencia con Next.js, TypeScript y AWS a producción en tan solo un mes. Desde el diseño y desarrollo hasta la infraestructura y el despliegue.',
      },
    },
  },
} as const satisfies StrictTranslations<Record<Locale, any>>;

export default async function Projects({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const text = TRANSLATIONS[locale];
  
  const projects = PROJECT_SLUGS.map((slug) => ({
    slug,
    imageSrc: PROJECT_ASSETS[slug],
    ...text.projects[slug],
  }));

  return (
    <main>
      <div className="page-container">
        <section className="section-grid pt-8 pb-10">
          <div className="col-span-4 md:col-span-7 md:col-start-2 lg:col-span-10 lg:col-start-2 flex flex-col gap-12">
            <h1 className="text-display">{text.heading}</h1>
            <div className="flex flex-col gap-24">
              {projects.map((project, index) => {
                const isPortfolioSite = project.slug === 'portfolio-site';
                const projectHref = isPortfolioSite ? '/projects' : `/projects/${project.slug}`;
                const linkLabel = isPortfolioSite ? text.underConstruction : text.viewProject;

                return (
                  <div
                    key={project.slug}
                    className={`flex flex-col lg:flex-row gap-6 lg:gap-16 lg:items-center ${
                      index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                    }`}
                  >
                    <h2 className="text-heading text-accent w-full lg:hidden">
                      {project.title}
                    </h2>
                    
                    <div className="w-full lg:w-1/2 aspect-video rounded-lg bg-surface flex items-center justify-center shrink-0 relative overflow-hidden">
                      {project.imageSrc ? (
                        <Image
                          src={project.imageSrc}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-label text-text-muted">
                          {text.projectImageLabel}
                        </span>
                      )}
                    </div>

                    <div className="w-full lg:w-1/2 flex flex-col gap-4">
                      <h2 className="text-heading text-accent hidden lg:block">
                        {project.title}
                      </h2>
                      <blockquote className="border-l-2 border-accent pl-4">
                        <p className="text-body-muted italic">{project.lesson}</p>
                      </blockquote>
                      <div className="w-fit">
                        <LinkButton href={projectHref}>{linkLabel}</LinkButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}