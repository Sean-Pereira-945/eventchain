import { NavLink } from 'react-router-dom';
import Button from '../UI/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="navbar" role="banner">
      <div className="navbar__glow" aria-hidden />
      <div className="navbar__brand">
        <span className="navbar__logo" aria-hidden>
          ✦
        </span>
        <div className="navbar__brand-copy">
          <span className="navbar__brand-title">EventChain</span>
          <span className="navbar__brand-subtitle">Futuristic event OS</span>
        </div>
      </div>
      <nav className="navbar__links hide-mobile" aria-label="Primary">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/events">Events</NavLink>
        <NavLink to="/certificates">Certificates</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </nav>
      <div className="navbar__actions">
        <Button variant="ghost" onClick={toggleTheme} size="sm" aria-label="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </Button>
        {isAuthenticated ? (
          <div className="navbar__user" aria-label="Account menu">
            <span className="navbar__avatar" aria-hidden>
              {initials || 'EC'}
            </span>
            <div className="navbar__user-info">
              <span>{user?.name}</span>
              <small>{user?.role ?? 'Explorer'}</small>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        ) : (
          <div className="navbar__auth hide-mobile">
            <NavLink to="/login">Login</NavLink>
            <Button as="a" href="/register" size="sm">
              Get started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
