import LinkButton from '@/components/LinkButton';

export default function Projects() {
  const projects = [
    {
      slug: 'realidad-mixta-python',
      title: 'Realidad Mixta con Python',
      lesson:
        'Sin experiencia previa en inteligencia artificial ni OpenCV, es posible llegar a un prototipo funcional en un mes si se aprende haciendo.',
    },
    {
      slug: 'sistema-inventario',
      title: 'Sistema de Inventario Full-Stack',
      lesson:
        'Centralizar la información evita errores en compras, stock y mantenimientos: el mayor valor no siempre está en el código, sino en cómo se organizan los datos.',
    },
    {
      slug: 'diseno-sistemas-minecraft',
      title: 'Diseño de Sistemas Digitales con Minecraft',
      lesson:
        'Un juego puede ser una herramienta pedagógica seria cuando se usa para hacer tangible un concepto abstracto.',
    },
  ];

  return (
    <main>
      <div className="page-container">
        <section className="section-grid pt-8 pb-24">
          <div className="col-span-4 md:col-span-7 md:col-start-2 lg:col-span-10 lg:col-start-2 flex flex-col gap-12">
            <h1 className="text-display">Proyectos</h1>
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
                    <span className="text-label text-text-muted">Imagen del proyecto</span>
                  </div>
                  <div className="w-full lg:w-1/2 flex flex-col gap-4">
                    <h2 className="text-heading text-accent hidden lg:block">
                      {project.title}
                    </h2>
                    <blockquote className="border-l-2 border-accent pl-4">
                      <p className="text-body-muted italic">{project.lesson}</p>
                    </blockquote>
                    <div className="w-fit">
                      <LinkButton href={`/projects/${project.slug}`}>Ver proyecto</LinkButton>
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