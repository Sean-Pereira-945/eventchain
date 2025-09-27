import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './MobileMenu.css';

const MobileMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-menu hide-desktop">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle menu">
        ☰
      </button>
      {open && (
        <nav className="mobile-menu__drawer">
          <NavLink to="/" onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/events" onClick={() => setOpen(false)}>
            Events
          </NavLink>
          <NavLink to="/certificates" onClick={() => setOpen(false)}>
            Certificates
          </NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)}>
            About
          </NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)}>
            Contact
          </NavLink>
        </nav>
      )}
    </div>
  );
};

export default MobileMenu;
