import './pages.css';

const AboutPage = () => (
  <section className="page" aria-labelledby="about-heading">
    <header className="page__header">
      <h1 id="about-heading">About the platform</h1>
      <p>We combine blockchain integrity with rich event tooling to create trustworthy hybrid experiences.</p>
    </header>
    <div className="page__card-grid">
      <article className="page__card">
        <h3>Decentralized proofs</h3>
        <p>Each certificate and ticket is anchored to the blockchain, enabling third-party verification.</p>
      </article>
      <article className="page__card">
        <h3>Real-time insights</h3>
        <p>Analytics dashboards highlight engagement funnels, on-site check-ins, and credential issuance velocity.</p>
      </article>
      <article className="page__card">
        <h3>Developer-first</h3>
        <p>REST and WebSocket APIs, SDKs, and webhooks integrate with your existing CRM and marketing stack.</p>
      </article>
    </div>
  </section>
);

export default AboutPage;
