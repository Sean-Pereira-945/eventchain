import { useEffect, useMemo, useState } from 'react';
import { format, formatDistanceStrict, parseISO } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorState from '../components/UI/ErrorState';
import EventMap from '../components/Events/EventMap';
import { getEvents } from '../services/eventService';
import './pages.css';

const getEventsFromPayload = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.data)) return payload.data.data;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

const deriveEventStats = (events) => {
  if (!events.length) {
    return {
      total: 0,
      live: 0,
      completed: 0,
      averageAttendance: 0,
      capacityUtilization: 0,
    };
  }

  const total = events.length;
  const live = events.filter((event) => ['published', 'ongoing'].includes(event.status)).length;
  const completed = events.filter((event) => event.status === 'completed').length;
  const attendanceTotals = events.reduce(
    (acc, event) => {
      const registered = event.analytics?.registrations ?? event.attendees?.length ?? 0;
      const attended = event.analytics?.attendanceRate
        ? Math.round((event.analytics.attendanceRate / 100) * registered)
        : event.attendees?.filter((attendee) => attendee.attended).length ?? 0;

      return {
        registered: acc.registered + registered,
        attended: acc.attended + attended,
        capacity: acc.capacity + (event.maxCapacity ?? 0),
      };
    },
    { registered: 0, attended: 0, capacity: 0 }
  );

  const averageAttendance = attendanceTotals.registered
    ? Math.round((attendanceTotals.attended / attendanceTotals.registered) * 100)
    : 0;

  const capacityUtilization = attendanceTotals.capacity
    ? Math.min(100, Math.round((attendanceTotals.registered / attendanceTotals.capacity) * 100))
    : 0;

  return {
    total,
    live,
    completed,
    averageAttendance,
    capacityUtilization,
  };
};

const formatEventSchedule = (event) => {
  if (!event.date) return 'Schedule TBA';
  const start = parseISO(event.date);
  const formattedDate = format(start, 'MMMM d, yyyy');
  const timeRange = event.startTime && event.endTime ? `${event.startTime} → ${event.endTime}` : event.startTime || '';
  return `${formattedDate}${timeRange ? ` · ${timeRange}` : ''}`;
};

const formatEventDistance = (event) => {
  if (!event?.location?.city && !event?.location?.country) return event?.location?.address ?? 'Location TBA';
  return [event.location.city, event.location.country].filter(Boolean).join(', ');
};

const getTimeUntil = (event) => {
  if (!event?.date) return null;
  try {
    const start = parseISO(event.date);
    if (Number.isNaN(start.getTime())) return null;
    return formatDistanceStrict(start, new Date(), { addSuffix: true });
  } catch (error) {
    return null;
  }
};

const EventsPage = () => {
  const [selectedEventId, setSelectedEventId] = useState(null);

  const {
    data: eventsPayload,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['events', 'all'],
    queryFn: async () => {
      const response = await getEvents();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const events = useMemo(() => getEventsFromPayload(eventsPayload), [eventsPayload]);
  const stats = useMemo(() => deriveEventStats(events), [events]);

  useEffect(() => {
    if (!selectedEventId && events.length) {
      setSelectedEventId(events[0]._id);
    }
  }, [events, selectedEventId]);

  if (isError) {
    return (
      <section className="page" aria-labelledby="events-heading">
        <ErrorState
          title="We hit a snag loading events"
          message="Our event feed is momentarily unavailable. Refresh to try again."
          onRetry={refetch}
        />
      </section>
    );
  }

  return (
    <section className="page page--events" aria-labelledby="events-heading">
      <header className="page__header">
        <div>
          <h1 id="events-heading">Mission control for every event</h1>
          <p>Track live attendance, orchestrate logistics, and mint blockchain certificates from a single adaptive cockpit.</p>
        </div>
        <div className="page__header-actions">
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Syncing…' : 'Refresh feed'}
          </Button>
          <Button size="sm">Create event</Button>
        </div>
      </header>

      <section className="events-stats" aria-label="Event status summary">
        <StatCard label="Active programs" value={stats.live} subvalue={`${stats.total} total`} />
        <StatCard label="Completed" value={stats.completed} subvalue="Ready for certificate issuing" />
        <StatCard label="Avg attendance" value={`${stats.averageAttendance}%`} subvalue="Attendance vs registrations" />
        <StatCard label="Capacity utilization" value={`${stats.capacityUtilization}%`} subvalue="Seats claimed" />
      </section>

      <div className="events-grid">
        <div className="events-grid__list" role="list" aria-label="Event roster">
          {isFetching && !events.length ? (
            <LoadingSpinner message="Synchronizing the event roster…" />
          ) : events.length === 0 ? (
            <div className="empty-state">
              <h3>No events yet</h3>
              <p>Create your first event to unlock live dashboards, attendee badges, and spatial analytics.</p>
              <Button size="sm">Launch event</Button>
            </div>
          ) : (
            events.map((event) => (
              <article
                key={event._id}
                role="listitem"
                className={`event-card ${selectedEventId === event._id ? 'event-card--active' : ''}`}
                onClick={() => setSelectedEventId(event._id)}
              >
                <div className="event-card__header">
                  <div>
                    <span className={`event-chip event-chip--${event.status}`}>{event.status}</span>
                    <h3>{event.title}</h3>
                    <p>{event.shortDescription || event.description}</p>
                  </div>
                  {event.images?.[0]?.url && (
                    <img src={event.images[0].url} alt="Event visual" className="event-card__media" />
                  )}
                </div>
                <dl className="event-card__meta">
                  <div>
                    <dt>Schedule</dt>
                    <dd>{formatEventSchedule(event)}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{formatEventDistance(event)}</dd>
                  </div>
                  <div>
                    <dt>Capacity</dt>
                    <dd>{`${event.attendees?.length ?? 0} / ${event.maxCapacity ?? '∞'}`}</dd>
                  </div>
                  <div>
                    <dt>Time</dt>
                    <dd>{getTimeUntil(event) ?? 'Syncing timeline…'}</dd>
                  </div>
                </dl>
                <footer className="event-card__footer">
                  <div className="event-card__avatars" aria-label="Registered attendees">
                    {event.attendees?.slice(0, 4).map((attendee) => (
                      <span key={attendee.user?._id || attendee.user} className="event-avatar" title={attendee.user?.name}>
                        {(attendee.user?.name || 'A')[0]}
                      </span>
                    ))}
                    {event.attendees?.length > 4 && (
                      <span className="event-avatar event-avatar--more">+{event.attendees.length - 4}</span>
                    )}
                  </div>
                  <div className="event-card__actions">
                    <Button size="xs" variant="ghost">
                      Manage
                    </Button>
                    <Button size="xs" variant="outline">
                      View details
                    </Button>
                  </div>
                </footer>
              </article>
            ))
          )}
        </div>
        <div className="events-grid__map" aria-label="Event map">
          <EventMap events={events} selectedEventId={selectedEventId} onSelectEvent={setSelectedEventId} />
        </div>
      </div>

      {selectedEventId && (
        <EventIntelPanel event={events.find((event) => event._id === selectedEventId)} />
      )}
    </section>
  );
};

const StatCard = ({ label, value, subvalue }) => (
  <article className="stat-card">
    <dt>{label}</dt>
    <dd>
      <strong>{value}</strong>
      <span>{subvalue}</span>
    </dd>
  </article>
);

const EventIntelPanel = ({ event }) => {
  if (!event) return null;

  return (
    <section className="event-intel" aria-label="Event insights">
      <header>
        <h2>Live mission feed</h2>
        <p>Real-time metrics synced from the analytics engine. Deploy new actions or trigger QR checkpoints instantly.</p>
      </header>
      <div className="event-intel__grid">
        <div className="event-intel__card">
          <h3>Attendance signals</h3>
          <ul>
            <li>
              Registered attendees
              <span>{event.attendees?.length ?? 0}</span>
            </li>
            <li>
              Confirmed check-ins
              <span>{event.attendees?.filter((attendee) => attendee.attended).length ?? 0}</span>
            </li>
            <li>
              Certificates ready
              <span>{event.attendees?.filter((attendee) => attendee.certificateIssued).length ?? 0}</span>
            </li>
          </ul>
        </div>
        <div className="event-intel__card">
          <h3>Mission settings</h3>
          <ul>
            <li>
              Attendance radius
              <span>{event.attendanceRadius ?? 100} m</span>
            </li>
            <li>
              Credits awarded
              <span>{event.credits ?? 1}</span>
            </li>
            <li>
              Strict check-in
              <span>{event.strictAttendance ? 'Enabled' : 'Flexible'}</span>
            </li>
          </ul>
        </div>
        <div className="event-intel__card">
          <h3>Organizer</h3>
          <ul>
            <li>
              {event.organizer?.name || '—'}
              <span>{event.organizer?.email || 'Private'}</span>
            </li>
            <li>
              Venue
              <span>{event.location?.venue}</span>
            </li>
            <li>
              Address
              <span>{event.location?.address}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default EventsPage;
