import LinkButton from '@/components/LinkButton';
import { type Locale } from '@/lib/config';
import { type StrictTranslations } from '@/lib/localizer';

const PROJECT_SLUGS = ['realidad-mixta-python', 'sistema-inventario', 'diseno-sistemas-minecraft'] as const;

const TRANSLATIONS = {
  en: {
    heading: "Projects",
    projectImageLabel: "Project image",
    viewProject: "View project",
    projects: {
      'realidad-mixta-python': {
        title: 'Mixed Reality with Python',
        lesson:
          'With no prior experience in artificial intelligence or OpenCV, it is possible to reach a working prototype in a month by learning as you build.',
      },
      'sistema-inventario': {
        title: 'Full-Stack Inventory System',
        lesson:
          'Centralizing information prevents errors in purchasing, stock, and maintenance: the greatest value is not always in the code, but in how the data is organized.',
      },
      'diseno-sistemas-minecraft': {
        title: 'Designing Digital Systems with Minecraft',
        lesson:
          'A game can be a serious pedagogical tool when it is used to make an abstract concept tangible.',
      },
    },
  },
  es: {
    heading: "Proyectos",
    projectImageLabel: "Imagen del proyecto",
    viewProject: "Ver proyecto",
    projects: {
      'realidad-mixta-python': {
        title: 'Realidad Mixta con Python',
        lesson:
          'Sin experiencia previa en inteligencia artificial ni OpenCV, es posible llegar a un prototipo funcional en un mes si se aprende haciendo.',
      },
      'sistema-inventario': {
        title: 'Sistema de Inventario Full-Stack',
        lesson:
          'Centralizar la información evita errores en compras, stock y mantenimientos: el mayor valor no siempre está en el código, sino en cómo se organizan los datos.',
      },
      'diseno-sistemas-minecraft': {
        title: 'Diseño de Sistemas Digitales con Minecraft',
        lesson:
          'Un juego puede ser una herramienta pedagógica seria cuando se usa para hacer tangible un concepto abstracto.',
      },
    },
  },
} as const satisfies StrictTranslations<Record<Locale, any>>;

export default async function Projects({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const text = TRANSLATIONS[locale];
  const projects = PROJECT_SLUGS.map((slug) => ({
    slug,
    ...text.projects[slug],
  }));

  return (
    <main>
      <div className="page-container">
        <section className="section-grid pt-8 pb-24">
          <div className="col-span-4 md:col-span-7 md:col-start-2 lg:col-span-10 lg:col-start-2 flex flex-col gap-12">
            <h1 className="text-display">{text.heading}</h1>
            <div className="flex flex-col gap-24">
              {projects.map((project, index) => (
                <div
                  key={project.slug}
                  className={`flex flex-col lg:flex-row gap-6 lg:gap-16 lg:items-center ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <h2 className="text-heading text-accent w-full lg:hidden">
                    {project.title}
                  </h2>
                  <div className="w-full lg:w-1/2 aspect-video rounded-lg bg-surface flex items-center justify-center shrink-0">
                    <span className="text-label text-text-muted">{text.projectImageLabel}</span>
                  </div>
                  <div className="w-full lg:w-1/2 flex flex-col gap-4">
                    <h2 className="text-heading text-accent hidden lg:block">
                      {project.title}
                    </h2>
                    <blockquote className="border-l-2 border-accent pl-4">
                      <p className="text-body-muted italic">{project.lesson}</p>
                    </blockquote>
                    <div className="w-fit">
                      <LinkButton href={`/projects/${project.slug}`}>{text.viewProject}</LinkButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}