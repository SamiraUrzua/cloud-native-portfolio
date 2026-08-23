import { type Locale } from '@/lib/config';
import { type StrictTranslations } from '@/lib/localizer';
import { ArticleContent } from '@/components/ArticleContent';

const TRANSLATIONS = {
  en: {
    heading: "Mixed reality without specialized hardware",
    content: ``,
  },
  es: {
    heading: "Realidad mixta sin hardware especializado",
    content: `
Estamos en la era del vibe coding, donde tu IA favorita resuelve un bug inyectando 100 líneas de código spaghetti deluxe con bologñesa al proyecto para circunnavegar una mala arquitectura. Yo voy en la dirección opuesta, con una infinidad de características empaquetadas en solo 2.200 líneas.

<Pullquote>Mi código no crece en volumen con el tiempo, crece en simplicidad y elegancia.</Pullquote>

<Video src="" caption="Video del proyecto" />

Te juro por lo más sagrado que cuando empecé a programar este proyecto, mi intención no era traer monitas chinas a mi habitación, pero, como decía Bob Ross: "No cometemos errores, solo accidentes felices".

Entrando en materia, este proyecto partió como un simple experimento para combinar el mundo virtual con el mundo real. Y con mundo virtual me refiero específicamente al juego llamado VRChat, que permite conectarte con usuarios de cualquier lugar del mundo en un entorno 3D de realidad virtual. Originalmente, el programa solo alineaba la cámara virtual con la real usando AprilTags, pequeños papeles con un patrón parecido al de un código QR que la cámara puede detectar para determinar su posición y orientación en el espacio. Con esa información, podía hacer que la cámara virtual viera el mundo desde exactamente el mismo punto de vista que la cámara real.

Con una cámara virtual y una real alineadas, teníamos dos imágenes que podían combinarse de distintas maneras, usando trucos de edición de video, incluso en tiempo real. Eso sí, esta combinación se hacía manualmente, fuera del código. Aun así se podían lograr efectos bastante interesantes con esta aproximación.

<Figure src="/mixed-reality/ARPrevious.webp" caption="Composición AR con AprilTags, sin datos de profundidad." size="large" />

El problema es que esta aproximación sufre de lo que yo llamo "el efecto Pokémon GO": los objetos virtuales se superponen sobre el mundo real sin ninguna consideración del espacio en el que están. Un objeto virtual puede estar detrás de una pared en el mundo real y aun así aparecer dibujado encima de ella.

Si tan solo pudiéramos conocer la profundidad de la escena de alguna manera, podríamos integrar ambas imágenes en el espacio y calcular las oclusiones (Que está delante de que).

<Figure src="/mixed-reality/PokemonGO.webp" caption="El mismo problema en Pokémon GO: objetos sin sentido de espacio." />

Okay, pero ¿cómo rayos podemos hacer eso? No es como que podamos conocer la tridimensionalidad del espacio sin hardware especializado, de hecho, Pokémon GO descartó su realidad aumentada en favor de una nueva que requiere hardware especializado o, en su defecto, movimientos de cámara para detectar profundidad. Pero nosotros solo tenemos una webcam común, corriente y fija en el espacio.

Aquí es cuando la IA viene a salvar el proyecto. Pero no cualquier IA, sino un modelo de profundidad métrica, capaz de escanear una imagen y producir un mapa de profundidad, que en simples palabras es una estimación de la distancia a la que está cada pixel de la cámara.

Esa IA se encarga del mundo real. En el mundo virtual no hay nada que estimar, el juego ya sabe a qué distancia está cada objeto, solo hay que pedírselo. Así, cada mundo nos entrega su imagen y su mapa de profundidad. Como las dos cámaras están alineadas, podemos comparar ambas profundidades pixel por pixel y decidir qué objetos están delante de cuáles en cada punto de la imagen. Es decir: las oclusiones.

Lo sé, es mucho más fácil decirlo que hacerlo. Y es aquí cuando la complejidad del proyecto explota. Estos modelos de IA son lentos y esta aplicación necesita correr en tiempo real. Una cámara típica suele tener 30 o 60 cuadros por segundo (frames), pero el modelo de IA (Depth Anything V2), en su versión pequeña, solo lograba 10-15 por segundo en mi tarjeta gráfica decente, es decir, la mayoría de los frames se quedaba sin mapa de profundidad.

Pero bueno, si no tenemos esos mapas de profundidad que nos faltan, podemos simplemente estimarlos a partir de los que tenemos. Si esperamos un poco hasta que nuestra IA genere el siguiente mapa de profundidad, tendremos el anterior y el nuevo. Con esos dos como referencia se pueden hacer estimaciones bastante buenas de todos los que faltan entre medio. Esto se conoce como interpolación. Lo bueno de esta solución es que resuelve el problema de la lentitud de los modelos y de paso nos ofrece un ajuste automático, entre más capacidad de cómputo tengamos, menos mapas de profundidad necesitaremos estimar.

Y listo, problema solucionado. ¿No? Pues no. Esto es como un juego de golpear al topo, le pego a un problema y se levantan dos más. El primer problema aparece por la propia naturaleza de este método. Al tener que esperar al siguiente frame se crea una latencia extra, y entre más frames generamos, más tenemos que esperar y, por lo tanto, más latencia. Aquí no hay vuelta que darle, no podemos evitar esa latencia con el método actual.

Pero todavía queda algo más. Hasta ahora estábamos mostrando en la salida de nuestro software los frames finales apenas estaban disponibles. Esto funciona relativamente bien cuando todos los frames tardan casi lo mismo en procesarse. Con los nuevos cambios, los frames ya no tardan todos lo mismo en calcularse. Algunos están listos casi inmediatamente y otros necesitan bastante más tiempo, así que terminamos mostrando los frames a un ritmo muy diferente al que fueron capturados.

Pero, ¿qué me estás pidiendo? ¿Que haga un sistema que tenga consistencia temporal, minimice la latencia y además pueda amortiguar los tiempos variables de procesamiento de los frames? ¡Pues claro que sí! Y no solo eso. También que funcione de forma adaptativa, ajustándose automáticamente a la capacidad de cómputo disponible.

Para solucionar todos estos problemas, el día de hoy presentamos, en una oferta exclusiva, el <Accent>Buffer Adaptativo™</Accent>. ¿Estás cansado de que tus frames lleguen cuando se les dé la **** gana? ¿Ya no das más de tener que elegir entre una reproducción fluida y una latencia baja?

¡Introduciendo una nueva (muy vieja) y revolucionaria tecnología que permite acumular una cantidad variable de latencia para absorber todas las inconsistencias de reproducción! En lugar de mostrar cada frame apenas está disponible, esperamos un pequeño margen de tiempo antes de comenzar a mostrarlos, permitiendo mantener un ritmo de reproducción mucho más consistente.

Pero espera, ¡hay más! El tamaño de este buffer no es fijo. El sistema observa cuánto están tardando en llegar los frames y ajusta dinámicamente cuánto necesita acumular. Si los frames comienzan a tardar más, el buffer crece para amortiguar la variación. Si empiezan a llegar más rápido, el buffer se reduce para recuperar la menor latencia posible.
`,
  },
} as const satisfies StrictTranslations<Record<Locale, any>>;

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
          <div className="col-span-4 md:col-span-7 md:col-start-2 lg:col-span-10 lg:col-start-2">
            <h1 className="text-display">
              {text.heading}
            </h1>
          </div>
        </section>

        <section className="section-grid pb-16">
          <div className="col-span-4 md:col-span-7 md:col-start-2 lg:col-span-10 lg:col-start-2 flex flex-col">
            <ArticleContent content={text.content} />
          </div>
        </section>
      </div>
    </main>
  );
}