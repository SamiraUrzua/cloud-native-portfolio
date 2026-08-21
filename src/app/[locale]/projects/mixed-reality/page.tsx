import { type Locale } from '@/lib/config';
import { type StrictTranslations } from '@/lib/localizer';

type ContentBlock =
  | { type: 'text'; heading?: string; body: string }
  | { type: 'pullquote'; text: string }
  | { type: 'image'; src: string; caption?: string; size?: 'large' | 'default' }
  | { type: 'video'; src: string; caption?: string };

const TRANSLATIONS = {
  en: {
    heading: "Mixed reality without specialized hardware",
    summary: "",
    blocks: [] as ContentBlock[],
  },
  es: {
    heading: "Realidad mixta sin hardware especializado",
    summary:
      "Estamos en la era del vibe coding, donde tu IA favorita resuelve un bug inyectando 100 líneas de código spaghetti deluxe con bologñesa al proyecto para circunnavegar una mala arquitectura. Yo voy en la dirección opuesta, con una infinidad de características empaquetadas en solo 2.200 líneas.",
    blocks: [
      {
        type: 'pullquote',
        text: 'Mi código no crece en volumen con el tiempo, crece en simplicidad y elegancia.',
      },
      {
        type: 'video',
        src: '',
        caption: 'Video del proyecto',
      },
      {
        type: 'text',
        body:
          'Te juro por lo más sagrado que cuando empecé a programar este proyecto, mi intención no era traer monitas chinas a mi habitación, pero, como decía Bob Ross: "No cometemos errores, solo accidentes felices".\n\nEntrando en materia, este proyecto partió como un simple experimento para combinar el mundo virtual con el mundo real. Y con mundo virtual me refiero específicamente al juego llamado VRChat, que permite conectarte con usuarios de cualquier lugar del mundo en un entorno 3D de realidad virtual. Originalmente, el programa solo alineaba la cámara virtual con la real usando marcadores fiduciales, en este caso AprilTags, que se ven como un pequeño código QR. Estos AprilTags me permiten saber dónde estaba la cámara real y hacer que la cámara virtual tenga exactamente la misma posición y orientación.\n\nLuego, la combinación de la vista real y virtual escapaba del alcance del código, debía hacerse manualmente. Y sí, se pueden lograr efectos bastante interesantes con esta aproximación.',
      },
      {
        type: 'image',
        src: '/mixed-reality/ARPrevious.webp',
        caption: 'Composición AR con AprilTags, sin datos de profundidad.',
        size: 'large',
      },
      {
        type: 'text',
        body:
          'El problema es que esta aproximación sufre de lo que yo llamo "el efecto Pokémon GO": los objetos virtuales se superponen sobre el mundo real sin ninguna consideración del espacio en el que están. Un objeto virtual puede estar detrás de una pared en el mundo real y aun así aparecer dibujado encima de ella.\n\nSi tan solo pudiéramos conocer la profundidad de la escena de alguna manera, podríamos integrar ambas imágenes en el espacio y calcular las oclusiones (Que está delante de que).',
      },
      {
        type: 'image',
        src: '/mixed-reality/PokemonGO.webp',
        caption: 'El mismo problema en Pokémon GO: objetos sin sentido de espacio.',
      },
      {
        type: 'text',
        body:
          'Okay, pero ¿cómo rayos podemos hacer eso? No es como que podamos conocer la tridimensionalidad del espacio sin hardware especializado, de hecho, Pokémon GO descartó su realidad aumentada en favor de una nueva que requiere hardware especializado o, en su defecto, movimientos de cámara para triangular objetos. Pero nosotros solo tenemos una webcam común, corriente y fija en el espacio.\n\nAquí es cuando la IA viene a salvar el proyecto. Pero no cualquier IA, sino un modelo de profundidad métrica, capaz de escanear una imagen y producir un mapa de profundidad, que en simples palabras es una estimación de la distancia a la que está cada pixel de la cámara.\n\nPara el mundo real utilizamos la IA. Para el mundo virtual utilizamos un shader que nos entrega directamente la profundidad de la escena. De esta forma tenemos ambas imágenes RGB y sus respectivos mapas de profundidad. Como las dos cámaras están alineadas, podemos comparar ambas profundidades pixel por pixel y decidir qué objetos están delante de cuáles en cada punto de la imagen. Es decir: las oclusiones.',
      },
      {
        type: 'text',
        body:
          'Lo sé, es mucho más fácil decirlo que hacerlo. Y es aquí cuando la complejidad del proyecto explota. La limitación que tienen estos modelos de IA es que obtener un mapa de profundidad es bastante costoso, y esta aplicación necesita correr en tiempo real. En este caso utilizamos "Depth Anything V2", un modelo financiado por TikTok. Tomamos la versión pequeña del modelo, le dimos toda la potencia de mi RTX 3060, y apenas lograba 10-15 FPS. Eso significa que mientras la cámara puede estar capturando 30 o 60 frames por segundo, la IA solo consigue producir profundidad para 10-15 de ellos.\n\nLa solución que implementé para mejorar el rendimiento fue generar frames de profundidad sintéticos. Esperamos a que el modelo calcule el siguiente frame real y, una vez que lo tenemos, usamos el frame actual y el anterior para calcular con un método más rápido los frames que faltaron entre medio. Esta solución es automáticamente responsiva, entre más capacidad de cómputo tengamos disponible, menos frames necesitan ser generados.\n\nY listo, problema solucionado. ¿No? Pues no. Esto es como un juego de golpear al topo, le pego a un problema y se levantan dos más. El primer problema aparece por la propia naturaleza de este método. Al tener que esperar al siguiente frame se crea una latencia extra, y entre más frames generamos, más tenemos que esperar y, por lo tanto, más latencia. Aquí no hay vuelta que darle, no podemos evitar esa latencia con el método actual.\n\nPero todavía quedaba algo más. Hasta ahora estábamos mostrando en la salida de nuestro software los frames finales apenas estaban disponibles. Esto funciona relativamente bien cuando todos los frames tardan casi lo mismo en procesarse. Con los nuevos cambios, los frames ya no tardan todos lo mismo en calcularse. Algunos están listos casi inmediatamente y otros necesitan bastante más tiempo, así que terminamos mostrando los frames a un ritmo muy diferente al que fueron capturados.\n\nPero, ¿qué me estás pidiendo? ¿Que haga un sistema que tenga consistencia temporal, minimice la latencia y además pueda amortiguar los tiempos variables de procesamiento de los frames? ¡Pues claro que sí! Y no solo eso. También que funcione de forma adaptativa, ajustándose automáticamente a la capacidad de cómputo disponible.\n\nPara solucionar todos estos problemas, el día de hoy presentamos, en una oferta exclusiva, el *Buffer Adaptativo™*. ¿Estás cansado de que tus frames lleguen cuando se les dé la \\*\\*\\*\\* gana? ¿Ya no das más de tener que elegir entre una reproducción fluida y una latencia baja?\n\n¡Introduciendo una nueva (muy vieja) y revolucionaria tecnología que permite acumular una cantidad variable de latencia para absorber todas las inconsistencias de reproducción! En lugar de mostrar cada frame apenas está disponible, esperamos un pequeño margen de tiempo antes de comenzar a mostrarlos, permitiendo mantener un ritmo de reproducción mucho más consistente.\n\nPero espera, ¡hay más! El tamaño de este buffer no es fijo. El sistema observa cuánto están tardando en llegar los frames y ajusta dinámicamente cuánto necesita acumular. Si los frames comienzan a tardar más, el buffer crece para amortiguar la variación. Si empiezan a llegar más rápido, el buffer se reduce para recuperar la menor latencia posible.',
      },
                'Lo sé, es mucho más fácil decirlo que hacerlo. Y es aquí cuando la complejidad del proyecto explota. La limitación que tienen estos modelos de IA es que obtener un mapa de profundidad es bastante costoso, y esta aplicación necesita correr en tiempo real. En este caso utilizamos "Depth Anything V2", un modelo financiado por TikTok. Tomamos la versión pequeña del modelo, le dimos toda la potencia de mi RTX 3060, y apenas lograba 10-15 FPS. Eso significa que mientras la cámara puede estar capturando 30 o 60 frames por segundo, la IA solo consigue producir profundidad para 10-15 de ellos.\n\nLa solución que implementé para mejorar el rendimiento fue generar frames de profundidad sintéticos. Esperamos a que el modelo calcule el siguiente frame real y, una vez que lo tenemos, usamos el frame actual y el anterior para calcular con un método más rápido los frames que faltaron entre medio. Esta solución es automáticamente responsiva, entre más capacidad de cómputo tengamos disponible, menos frames necesitan ser generados.\n\nY listo, problema solucionado. ¿No? Pues no. Esto es como un juego de golpear al topo, le pego a un problema y se levantan dos más. El primero aparece por la propia naturaleza de este método. Al tener que esperar al siguiente frame se crea una latencia extra, y entre más frames generamos, más tenemos que esperar y, por lo tanto, más latencia. Aquí no hay vuelta que darle, no podemos evitar esa latencia con el método actual.\n\nPero todavía quedaba algo más. Hasta ahora estábamos mostrando en la salida de nuestro software los frames finales apenas estaban disponibles. Esto funciona relativamente bien cuando todos los frames tardan casi lo mismo en procesarse. Con los nuevos cambios, los frames ya no tardan todos lo mismo en calcularse. Algunos están listos casi inmediatamente y otros necesitan bastante más tiempo, así que terminamos mostrando los frames a un ritmo muy diferente al que fueron capturados.\n\nPero, ¿qué me estás pidiendo? ¿Que haga un sistema que tenga consistencia temporal, minimice la latencia y además pueda amortiguar los tiempos variables de procesamiento de los frames? ¡Pues claro que sí! Y no solo eso. También que funcione de forma adaptativa, ajustándose automáticamente a la capacidad de cómputo disponible.\n\nPara solucionar todos estos problemas, el día de hoy presentamos, en una oferta exclusiva, el *Buffer Adaptativo™*. ¿Estás cansado de que tus frames lleguen cuando se les dé la *\*\*\*\** gana? ¿Ya no das más de tener que elegir entre una reproducción fluida y una latencia baja?\n\n¡Introduciendo una nueva (muy vieja) y revolucionaria tecnología que permite acumular una cantidad variable de latencia para absorber todas las inconsistencias de reproducción! En lugar de mostrar cada frame apenas está disponible, esperamos un pequeño margen de tiempo antes de comenzar a mostrarlos, permitiendo mantener un ritmo de reproducción mucho más consistente.\n\nPero espera, ¡hay más! El tamaño de este buffer no es fijo. El sistema observa cuánto están tardando en llegar los frames y ajusta dinámicamente cuánto necesita acumular. Si los frames comienzan a tardar más, el buffer crece para amortiguar la variación. Si empiezan a llegar más rápido, el buffer se reduce para recuperar la menor latencia posible.',
    ] as ContentBlock[],
  },
} as const satisfies StrictTranslations<Record<Locale, any>>;

function renderAccent(text: string) {
  const result = [];
  let current = '';
  let isAccent = false;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\\' && text[i + 1] === '*') {
      current += '*';
      i++;
    } 
    else if (text[i] === '*') {
      if (current) {
        result.push(
          isAccent ? (
            <span key={i} className="text-accent">{current}</span>
          ) : (
            current
          )
        );
        current = '';
      }
      isAccent = !isAccent;
    } 
    else {
      current += text[i];
    }
  }

  if (current) {
    result.push(
      isAccent ? (
        <span key="end" className="text-accent">{current}</span>
      ) : (
        current
      )
    );
  }

  return result;
}
interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function MixedReality({ params }: PageProps) {
  const { locale } = await params;
  const text = TRANSLATIONS[locale];

  return (
    <main>
      <div className="page-container">
        <section className="section-grid pt-8 pb-10">
          <div className="col-span-4 md:col-span-7 md:col-start-2 lg:col-span-10 lg:col-start-2 flex flex-col gap-8">
            <h1 className="text-display">
              {text.heading}
            </h1>

            <p className="text-body">
              {text.summary}
            </p>
          </div>
        </section>

        <section className="section-grid pb-16">
          <div className="col-span-4 md:col-span-7 md:col-start-2 lg:col-span-10 lg:col-start-2 flex flex-col">
            {text.blocks.map((block, index) => {
              if (block.type === 'text') {
                return (
                  <div key={index} className="flex flex-col gap-4 pb-8">
                    {block.heading && (
                      <h2 className="text-heading pb-2">
                        {block.heading}
                      </h2>
                    )}

                    {block.body.split('\n\n').map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex} className="text-body">
                        {renderAccent(paragraph)}
                      </p>
                    ))}
                  </div>
                );
              }

              if (block.type === 'pullquote') {
                return (
                  <blockquote
                    key={index}
                    className="border-l-2 border-accent pl-6 py-2 mb-8"
                  >
                    <p className="text-heading text-accent">
                      {block.text}
                    </p>
                  </blockquote>
                );
              }

              if (block.type === 'image') {
                if (!block.src) return null;

                return (
                  <figure
                    key={index}
                    className={`mx-auto flex flex-col items-center gap-2 py-8 ${
                      block.size === 'large' ? 'max-w-2xl' : 'max-w-md'
                    }`}
                  >
                    <img
                      src={block.src}
                      alt={block.caption ?? ''}
                      className="w-full rounded-lg"
                    />

                    {block.caption && (
                      <figcaption className="text-body-muted text-sm text-center">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              }

              if (!block.src) return null;

              return (
                <figure
                  key={index}
                  className="flex flex-col gap-2 py-8"
                >
                  <video
                    src={block.src}
                    controls
                    className="w-full rounded-lg"
                  />

                  {block.caption && (
                    <figcaption className="text-body-muted text-sm">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}