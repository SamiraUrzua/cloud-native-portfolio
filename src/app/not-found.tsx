import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 justify-center pt-24">
      <div className="text-center">
        <h1 className="text-8xl font-bold">404</h1>
        <p className="text-2xl text-text-muted mt-4">
          Esta página no pudo ser encontrada,
          <br />
          pero si sigues buscando podrás encontrar una desarrolladora :)
        </p>
        <Link
          href="/"
          className="text-accent mt-8 inline-block text-3xl font-bold"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}