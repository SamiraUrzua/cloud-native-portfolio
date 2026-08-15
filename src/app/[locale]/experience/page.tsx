import { type Locale } from '@/lib/config';
import { type StrictTranslations } from '@/lib/localizer';

const TRANSLATIONS = {
  en: {
    heading: "Professional experience",
    roles: [
      {
        title: 'Independent Software Developer',
        company: '',
        period: 'October 2023 - present',
        stack: ['Python', 'PySide', 'OpenCV', 'PyTorch', 'CUDA', 'Depth AI', 'Linux'],
        points: [
          'Developed a mixed reality desktop application in Python combining physical and digital environments. With no prior experience in artificial intelligence or OpenCV, reached a working prototype in a month, close to cutting-edge technologies in the field.',
        ],
      },
      {
        title: 'Full-Stack Developer, Capstone Project',
        company: 'Guiñez Ingeniería Ltda.',
        period: 'March 2023 - August 2023',
        stack: ['PySide', 'SQL'],
        points: [
          'Developed a full-stack desktop application with PySide and SQL that improved inventory management and internal operations, centralizing information and preventing errors in purchasing, stock control, and maintenance management.',
        ],
      },
      {
        title: 'Instructor, DeLTA UCN',
        company: '',
        period: 'June 2022 - December 2023',
        stack: ['Teaching', 'Minecraft'],
        points: [
          'Taught digital systems design classes using Minecraft as a pedagogical resource to facilitate hands-on learning and problem-solving.',
          'Coordinated group activities and projects with students of different needs and learning paces, adapting activities and communicating technical concepts clearly.',
        ],
      },
      {
        title: 'Software Development Internship',
        company: 'Universidad de Playa Ancha',
        period: 'October 2022 - December 2022',
        stack: ['C++'],
        points: [
          'Developed a desktop application in C++ that allows students to solve math problems interactively and collects data for research in mathematics didactics.',
        ],
      },
    ],
  },
  es: {
    heading: "Experiencia profesional",
    roles: [
      {
        title: 'Desarrolladora de Software Independiente',
        company: '',
        period: 'octubre 2023 - presente',
        stack: ['Python', 'PySide', 'OpenCV', 'PyTorch', 'CUDA', 'Depth AI', 'Linux'],
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
    ],
  },
} as const satisfies StrictTranslations<Record<Locale, any>>;

export default async function Experience({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const text = TRANSLATIONS[locale];
  const roles = text.roles;

  return (
    <main>
      <div className="page-container">
        <section className="section-grid items-center pt-8 pb-10">
          <div className="col-span-4 md:col-span-7 md:col-start-2 lg:col-span-10 lg:col-start-2 flex flex-col gap-12">
            <h1 className="text-display">{text.heading}</h1>
            <div className="relative flex flex-col gap-16">
              <div className="absolute left-[6px] top-2 md:top-3 bottom-2 w-[2px] -translate-x-1/2 bg-accent/40" />
              {roles.map((role) => (
                <div key={role.title} className="flex gap-6">
                  <div className="flex w-[12px] justify-center pt-2 md:pt-3">
                    <span className="h-3 w-3 rounded-full bg-accent" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-heading text-accent">{role.title}</h2>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {role.company && (
                          <span className="text-body font-medium">
                            {role.company}
                          </span>
                        )}
                        {role.company && <span className="text-body">·</span>}
                        <span className="text-body">
                          {role.period}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 max-w-3xl">
                      {role.points.map((point) => (
                        <p key={point} className="text-body-muted">
                          {point}
                        </p>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {role.stack.map((tech) => (
                        <span
                          key={tech}
                          className="text-label rounded-full border border-accent/40 bg-accent/15 px-3.5 py-1.5 text-accent font-semibold"
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