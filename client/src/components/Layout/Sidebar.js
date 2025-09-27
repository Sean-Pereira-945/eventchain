import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => (
  <aside className="sidebar hide-mobile">
    <h3 className="sidebar__title">Dashboard</h3>
    <nav className="sidebar__nav">
      <NavLink to="/events" end>
        Event Overview
      </NavLink>
      <NavLink to="/events/calendar">Calendar</NavLink>
      <NavLink to="/profile">My Profile</NavLink>
      <NavLink to="/certificates">My Certificates</NavLink>
      <NavLink to="/verify">Verify Certificates</NavLink>
      <NavLink to="/events/analytics">Analytics</NavLink>
    </nav>
    <div className="sidebar__card">
      <h4>Need help?</h4>
      <p>Access tutorials, documentation, and blockchain verification resources.</p>
      <a href="/docs" className="sidebar__link">
        View docs
      </a>
    </div>
  </aside>
);

export default Sidebar;
