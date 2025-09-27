import Button from '../components/UI/Button';
import './pages.css';

const CertificatesPage = () => (
  <section className="page" aria-labelledby="certificates-heading">
    <header className="page__header">
      <h1 id="certificates-heading">Certificates vault</h1>
      <p>Issue immutable credentials, manage revocations, and publish shareable verification links.</p>
    </header>
    <div className="page__content">
      <div className="page__section">
        <h2>Recent issuances</h2>
        <p>Connect to the certificates service to retrieve blockchain transaction hashes and metadata.</p>
        <Button type="button">Issue certificate</Button>
      </div>
      <div className="page__section">
        <h2>Templates</h2>
        <p>Upload new certificate templates or sync from your design system to keep branding consistent.</p>
      </div>
    </div>
  </section>
);

export default CertificatesPage;
