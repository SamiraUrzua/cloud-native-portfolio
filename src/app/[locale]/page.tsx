import Image from 'next/image';
import Link from 'next/link';
import ContactCard from '@/components/ContactCard';
import { type Locale } from '@/lib/config';
import { type StrictTranslations } from '@/lib/localizer';

const TRANSLATIONS = {
  en: {
    profession: "Civil Engineering in Computing and Informatics",
    underConstructionLabel: "Page still under construction",
    underConstructionText: "I'm still working on the rest of the site, new things are coming soon.",
    heroImageAlt: "Samira wearing a mixed reality headset, surrounded by virtual characters",
    heroImageCaption: "Mixed reality project",
  },
  es: {
    underConstructionLabel: "Página aún en construcción",
    underConstructionText: "Sigo trabajando en el resto del sitio, se vienen cositas",
    heroImageAlt: "Samira con lentes de realidad mixta, rodeada de personajes virtuales",
    heroImageCaption: "Proyecto de realidad mixta",
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
        <section className="section-grid items-center pt-8 pb-6">
          <div className="col-span-4 md:col-span-8 lg:col-span-5 flex flex-col justify-center gap-8">
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
          <Link
            href="/projects/mixed-reality"
            className="col-span-4 md:col-span-8 lg:col-span-7 block mt-10 lg:mt-0 transition-transform duration-500 ease-out hover:scale-105"
          >
          <figure className="flex flex-col items-center lg:items-end lg:pl-12 gap-3">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <Image
                src="/mixed-reality/ARPrevious.jpg"
                alt={text.heroImageAlt}
                fill
                priority
                className="object-cover opacity-80"
              />
            </div>
            <figcaption className="text-label text-accent">
              {text.heroImageCaption}
            </figcaption>
          </figure>
          </Link>
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