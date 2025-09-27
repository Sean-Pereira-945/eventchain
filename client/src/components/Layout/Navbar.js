import { NavLink } from 'react-router-dom';
import Button from '../UI/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="navbar__logo" aria-hidden>
          ⛓️
        </span>
        <span>EventChain</span>
      </div>
      <nav className="navbar__links hide-mobile">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/events">Events</NavLink>
        <NavLink to="/certificates">Certificates</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </nav>
      <div className="navbar__actions">
        <Button variant="ghost" onClick={toggleTheme} size="sm">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
        {isAuthenticated ? (
          <div className="navbar__user">
            <span>{user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        ) : (
          <div className="navbar__auth hide-mobile">
            <NavLink to="/login">Login</NavLink>
            <Button as="a" href="/register" size="sm">
              Sign up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
