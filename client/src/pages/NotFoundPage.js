import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';
import './pages.css';

const NotFoundPage = () => (
  <section className="page" aria-labelledby="notfound-heading">
    <div className="page__hero">
      <h1 id="notfound-heading">Page not found</h1>
      <p>The page you are looking for was moved, removed, renamed, or might never have existed.</p>
      <div className="page__cta">
        <Button type="button" onClick={() => window.history.back()}>
          Go back
        </Button>
        <Link to="/" className="page__link">
          Return home
        </Link>
      </div>
    </div>
  </section>
);

export default NotFoundPage;
