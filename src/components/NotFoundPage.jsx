import Link from 'next/link';

function NotFoundPage() {
  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="subtle">That page doesn't exist.</p>
      </section>
      <div className="card notFoundCard">
        <Link href="/" className="backLink">← Go home</Link>
      </div>
    </main>
  );
}

export default NotFoundPage;
