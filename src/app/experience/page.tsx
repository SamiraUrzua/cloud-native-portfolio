export default function Experience() {
  const roles = [
    {
      title: 'Desarrolladora de Software Independiente',
      company: '',
      period: 'octubre 2023 - presente',
      stack: ['Python', 'OpenCV'],
      points: [
        'Desarrolló en Python una aplicación de escritorio de realidad mixta combinando entornos físicos y digitales. Sin experiencia previa en inteligencia artificial ni OpenCV, logró en un mes un prototipo funcional, cercano a tecnologías de vanguardia en el área.',
      ],
    },
    {
      title: 'Desarrolladora Full-Stack, Proyecto Capstone',
      company: 'Guiñez Ingeniería Ltda.',
      period: 'marzo 2023 - agosto 2023',
      stack: ['PySide', 'SQL'],
      points: [
        'Desarrolló una aplicación de escritorio full-stack con PySide y SQL que mejoró la gestión de inventario y operaciones internas, centralizando la información y evitando errores en compras, control de stock y gestión de mantenimientos.',
      ],
    },
    {
      title: 'Docente, DeLTA UCN',
      company: '',
      period: 'junio 2022 - diciembre 2023',
      stack: ['Docencia', 'Minecraft'],
      points: [
        'Impartió clases de diseño de sistemas digitales utilizando Minecraft como recurso pedagógico para facilitar el aprendizaje práctico y la resolución de problemas.',
        'Coordinó actividades grupales y proyectos con estudiantes con diferentes necesidades y ritmos de aprendizaje, adaptando las actividades y comunicando conceptos técnicos de forma clara.',
      ],
    },
    {
      title: 'Práctica de Desarrollo de Software',
      company: 'Universidad de Playa Ancha',
      period: 'octubre 2022 - diciembre 2022',
      stack: ['C++'],
      points: [
        'Desarrolló en C++ una aplicación de escritorio que permite a estudiantes resolver problemas matemáticos de forma interactiva y recopila datos para investigación en didáctica de la matemática.',
      ],
    },
  ];

  return (
    <main>
      <div className="page-container">
        <section className="section-grid pt-8 pb-24">
          <div className="col-span-4 md:col-span-7 md:col-start-2 lg:col-span-10 lg:col-start-2 flex flex-col gap-12">
            <h1 className="text-display">Experiencia profesional</h1>
            <div className="relative flex flex-col gap-16">
              <div className="absolute left-[6px] top-2 md:top-3 bottom-2 w-px -translate-x-1/2 bg-accent/20" />
              {roles.map((role) => (
                <div key={role.title} className="flex gap-6">
                  <div className="flex w-[12px] justify-center pt-2 md:pt-3">
                    <span className="h-3 w-3 rounded-full bg-accent" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-heading text-accent">{role.title}</h2>
                      <p className="text-body-muted">
                        {role.company ? `${role.company} · ` : ''}
                        {role.period}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 max-w-3xl">
                      {role.points.map((point) => (
                        <p key={point} className="text-body-muted">
                          {point}
                        </p>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.stack.map((tech) => (
                        <span
                          key={tech}
                          className="text-label rounded-full bg-accent/10 px-3 py-1 text-accent"
                        >
                          {tech}
                        </span>
                      ))}
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