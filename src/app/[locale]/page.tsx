import ContactCard from '@/components/ContactCard';

export default function Home() {
  return (
    <main>
      <div className="page-container">
        <section className="section-grid items-center pt-8 pb-24">
          <div className="col-span-4 md:col-span-8 lg:col-span-6 flex flex-col justify-center gap-8 order-2 lg:order-1">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent" />
              <span className="text-label text-accent">
                Ingeniería civíl en computación e informática
              </span>
            </div>
            <h1 className="text-display">
              Una chica muy uwu <span className="text-accent">construyendo</span> cosas bien uwu
            </h1>
            <p className="text-body-muted max-w-xl">
              Hola soy Sami, una chica que le gusta mucho
              escribir código y hacer cosas bien cul,
              deberías contratarme uwu. Me gusta hacer
              muchas cosas, lo que quiera haceer
              lo hago porque soy muy cul. 
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <ContactCard />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}