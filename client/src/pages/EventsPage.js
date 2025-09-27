import { NavLink, Routes, Route } from 'react-router-dom';
import Button from '../components/UI/Button';
import './pages.css';

const EventsOverview = () => (
  <div className="page__section">
    <h2>Upcoming events</h2>
    <p>Integrate with the events API to display real-time listings, waitlists, and blockchain audit trails.</p>
    <Button type="button">Create event</Button>
  </div>
);

const EventDetailsPlaceholder = () => (
  <div className="page__section">
    <h2>Event details</h2>
    <p>Select an event from the list to view attendee analytics, QR check-ins, and certificate issuance statuses.</p>
  </div>
);

const EventsPage = () => (
  <section className="page" aria-labelledby="events-heading">
    <header className="page__header">
      <h1 id="events-heading">Events workspace</h1>
      <p>Coordinate schedules, track attendance, and manage credentialing in one collaborative hub.</p>
    </header>
    <nav className="page__tabs" aria-label="Event sections">
      <NavLink to="." end>
        Overview
      </NavLink>
      <NavLink to="calendar">Calendar</NavLink>
      <NavLink to="map">Live map</NavLink>
      <NavLink to="analytics">Analytics</NavLink>
    </nav>
    <div className="page__content">
      <Routes>
        <Route index element={<EventsOverview />} />
        <Route path="calendar" element={<EventDetailsPlaceholder />} />
        <Route path="map" element={<EventDetailsPlaceholder />} />
        <Route path="analytics" element={<EventDetailsPlaceholder />} />
        <Route path="*" element={<EventDetailsPlaceholder />} />
      </Routes>
    </div>
  </section>
);

export default EventsPage;
