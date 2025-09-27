import './pages.css';

const ContactPage = () => (
  <section className="page" aria-labelledby="contact-heading">
    <header className="page__header">
      <h1 id="contact-heading">Contact us</h1>
      <p>Need a custom integration or enterprise support? Reach out to our solutions engineers.</p>
    </header>
    <div className="page__content">
      <div className="page__section">
        <h2>Support</h2>
        <p>Email: support@eventchain.example</p>
        <p>Phone: +1 (800) 555-0123</p>
      </div>
      <div className="page__section">
        <h2>Headquarters</h2>
        <p>221B Blockchain Lane, Suite 42</p>
        <p>San Francisco, CA</p>
      </div>
    </div>
  </section>
);

export default ContactPage;
