import { type Locale } from '@/lib/config';
import { type StrictTranslations } from '@/lib/localizer';

const TRANSLATIONS = {
  en: {
    heading: "About",
    poem: `No poem translation available yet.`,
  },
  es: {
    heading: "Acerca de",
    poem: `No soy la sombra que habita en el ciberespacio
Ni quien se oculta entre líneas de código
No solo sé hablar con unos y ceros
Ni le tengo miedo a conectar con los demás

Hay quienes dicen que un informático no puede ser de letras
Si puedo dividir un sistema en sus partes más pequeñas,
¿por qué no podría condensarlo hasta convertirlo en poema?
Si puedo escribir en Python, ¿por qué no podría escribir en verso?

Aprendí a tender cables para conectar humanos y máquinas
Ahora se tender palabras para conectarme a ti
Aprendí a escuchar a una máquina hasta que quiso escharme
Ahora que aprendi a escuchar ya puedo escucharte a ti

El código no es solo ciencia y matemáticas
el código es filosofía, es creatividad,
la capacidad de construir cualquier mundo
donde la única frontera es la imaginación

Me rehúso a ser un estereotipo
Yo soy más que solo números
No me defino por un molde ni una etiqueta
Me defino por todo lo que puedo construir`,
  },
} as const satisfies StrictTranslations<Record<Locale, any>>;

const fireflies = Array.from({ length: 40 }, (_, index) => {
  const seed = index * 47 + 13;
  const random = (value: number) => {
    const x = Math.sin(value) * 10000;
    return x - Math.floor(x);
  };

  return {
    id: index,
    left: `${random(seed) * 100}%`,
    top: `${random(seed + 1) * 100}%`,
    x1: `${(random(seed + 2) - 0.5) * 140}px`,
    y1: `${random(seed + 3) * 140}px`,
    x2: `${(random(seed + 4) - 0.5) * 140}px`,
    y2: `${random(seed + 5) * 140}px`,
    duration: `${12 + random(seed + 6) * 10}s`,
    delay: `${random(seed + 7) * -15}s`,
    color: index % 2 === 0 ? "var(--accent)" : "var(--accent-secondary)",
  };
});

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const text = TRANSLATIONS[locale];

  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute -left-20 -top-20 z-0 h-[280px] w-[280px] rounded-full bg-accent/25 blur-[80px] sm:-left-24 sm:-top-24 sm:h-[360px] sm:w-[360px] sm:blur-[100px] lg:-left-20 lg:-top-20 lg:h-[480px] lg:w-[480px] lg:blur-[120px]" />

      <div className="pointer-events-none absolute -bottom-20 -right-20 z-0 h-[280px] w-[280px] rounded-full bg-accent-secondary/25 blur-[80px] sm:-bottom-24 sm:-right-24 sm:h-[360px] sm:w-[360px] sm:blur-[100px] lg:-bottom-20 lg:-right-20 lg:h-[480px] lg:w-[480px] lg:blur-[120px]" />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {fireflies.map((firefly) => (
          <span
            key={firefly.id}
            className="firefly absolute h-[10px] w-[10px] rounded-full"
            style={{
              left: firefly.left,
              top: firefly.top,
              backgroundColor: firefly.color,
              boxShadow: `0 0 10px 4px ${firefly.color}, 0 0 30px 10px ${firefly.color}`,
              animationDuration: firefly.duration,
              animationDelay: firefly.delay,
              "--x1": firefly.x1,
              "--y1": firefly.y1,
              "--x2": firefly.x2,
              "--y2": firefly.y2,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <section className="section-grid relative z-10 pt-8 pb-8 text-center">
        <h1 className="text-display col-span-full mb-8">{text.heading}</h1>

        <div className="col-span-full flex justify-center px-4 sm:px-6">
          <div className="w-fit max-w-[calc(100vw-2rem)] rounded-2xl bg-gradient-to-br from-accent via-transparent to-accent-secondary p-px shadow-lg sm:max-w-[calc(100vw-3rem)]">
            <div className="relative rounded-2xl bg-background/80 p-6 backdrop-blur-sm sm:p-10">
              <span className="pointer-events-none absolute left-4 top-4 h-8 w-8 rounded-tl-lg border-l border-t border-accent/70" />
              <span className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 rounded-br-lg border-b border-r border-accent-secondary/70" />

              <div className="text-body whitespace-pre-wrap text-left text-[clamp(1rem,1.5vw,1.25rem)] leading-relaxed">
                {text.poem}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}