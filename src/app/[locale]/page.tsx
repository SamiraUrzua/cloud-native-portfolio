import ContactCard from '@/components/ContactCard';
import { type Locale } from '@/lib/config';
import { type StrictTranslations } from '@/lib/localizer';

const TRANSLATIONS = {
  en: {
    profession: "Civil Engineering in Computing and Informatics",
    heading: "A very uwu girl *building* cool things",
    description: "Hi, I'm Sami, a girl who really loves writing code and building cool stuff, you should hire me uwu. I like doing a lot of things, whatever I want to do I do because I'm very cool.",
  },
  es: {
    profession: "Ingeniería civil en computación e informática",
    heading: "Una chica muy uwu *construyendo* cosas bien uwu",
    description: "Hola soy Sami, una chica que le gusta mucho escribir código y hacer cosas bien cul, deberías contratarme uwu. Me gusta hacer muchas cosas, lo que quiera haceer lo hago porque soy muy cul.",
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
      </div>
    </main>
  );
}