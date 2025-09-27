import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer__content">
      <span>© {new Date().getFullYear()} EventChain. All rights reserved.</span>
      <div className="footer__links">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/support">Support</a>
      </div>
    </div>
  </footer>
);

export default Footer;
