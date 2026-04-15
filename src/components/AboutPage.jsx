import Link from 'next/link';

function AboutPage() {
  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">About Kalos</p>
        <h1>Member Intelligence Platform</h1>
        <p className="subtle">
          Kalos helps members track body composition data from DEXA scans and gives coaches
          AI-powered insights to guide training and nutrition.
        </p>
      </section>

      <section className="card accent">
        <h2>What is Kalos?</h2>
        <p>
          Kalos is a body composition tracking platform built around periodic DEXA scans.
          Members upload scan reports and watch their metrics — body fat, lean mass, weight, and
          visceral fat — trend over time. Coaches use MemberGPT to ask natural-language questions
          and get data-grounded answers in seconds.
        </p>
      </section>

      <section className="card">
        <h2>Key features</h2>
        <div className="featureGrid">
          <div className="featureCard">
            <h3>Scan history</h3>
            <p>See every DEXA scan in chronological order with clear before/after deltas.</p>
          </div>
          <div className="featureCard">
            <h3>Trend charts</h3>
            <p>Multi-line graphs show how each metric moves scan-to-scan with hoverable data points.</p>
          </div>
          <div className="featureCard">
            <h3>PDF upload</h3>
            <p>Upload any DEXA PDF and key metrics are parsed and saved automatically.</p>
          </div>
          <div className="featureCard">
            <h3>MemberGPT</h3>
            <p>Coaches ask plain-English questions and get AI answers grounded in real scan data.</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Demo credentials</h2>
        <p>All demo accounts share password: <strong>kalos123</strong></p>
        <div className="metricRow">
          <div className="metricTile"><span>1 scan</span><strong>jordan@kalos.demo</strong></div>
          <div className="metricTile"><span>2 scans</span><strong>alex@kalos.demo</strong></div>
          <div className="metricTile"><span>5 scans</span><strong>sarah@kalos.demo</strong></div>
          <div className="metricTile"><span>4 scans</span><strong>priya@kalos.demo</strong></div>
          <div className="metricTile"><span>5 scans</span><strong>marcus@kalos.demo</strong></div>
        </div>
      </section>

      <Link href="/login" className="backLink">← Back to login</Link>
    </main>
  );
}

export default AboutPage;
