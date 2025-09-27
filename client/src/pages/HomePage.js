import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';
import './pages.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <section className="page page--home" aria-labelledby="home-heading">
      <div className="page__hero">
        <h1 id="home-heading">Blockchain-powered event verification</h1>
        <p>
          Manage events, issue tamper-proof certificates, and monitor engagement analytics in real time. Secure,
          transparent, and built for hybrid experiences.
        </p>
        <div className="page__cta">
          <Button type="button" onClick={() => navigate('/register')}>
            Get started
          </Button>
          <Link to="/about" className="page__link">
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
