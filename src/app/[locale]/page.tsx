import ContactCard from '@/components/ContactCard';
import { type Locale } from '@/lib/config';
import { type StrictTranslations } from '@/lib/localizer';

const TRANSLATIONS = {
  en: {
    profession: "Civil Engineering in Computing and Informatics",
    underConstructionLabel: "Page still under construction",
    underConstructionText: "I'm still working on the rest of the site, new things are coming soon.",
  },
  es: {
    underConstructionLabel: "Página aún en construcción",
    underConstructionText: "Sigo trabajando en el resto del sitio, se vienen cositas",
  },
} as const satisfies StrictTranslations<Record<Locale, any>>;

function renderHeading(text: string) {
  const parts = text.split(/\*(.*?)\*/g);
  
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <span key={index} className="text-accent">
          {part}
        </span>
      );
    }
    return part;
  });
}

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const text = TRANSLATIONS[locale];

  return (
    <main>
      <div className="page-container">
        <section className="section-grid items-center pt-8 pb-10">
          <div className="col-span-4 md:col-span-8 lg:col-span-6 flex flex-col justify-center gap-8 order-2 lg:order-1">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent" />
              <span className="text-label text-accent">
                {text.profession}
              </span>
            </div>
            <h1 className="text-display">
              {renderHeading(text.heading)}
            </h1>
            <p className="text-body-muted max-w-xl">
              {text.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <ContactCard locale={locale} />
            </div>
          </div>
        </section>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pb-10">
          <span className="text-label text-accent">
            {text.underConstructionLabel}
          </span>
          <span className="text-body-muted">
            {text.underConstructionText}
          </span>
        </div>
      </div>
    </main>
  );
}