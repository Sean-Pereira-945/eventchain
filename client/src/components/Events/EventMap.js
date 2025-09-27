import { useMemo } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import './EventMap.css';

const DEFAULT_CENTER = [20, 0];
const DEFAULT_ZOOM = 2;

const createMarkerIcon = (isActive) =>
  L.divIcon({
    className: `event-marker ${isActive ? 'event-marker--active' : ''}`,
    html: '<span></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });

const MapFocus = ({ coordinates }) => {
  const map = useMap();

  useMemo(() => {
    if (!coordinates) return;
    map.flyTo([coordinates.lat, coordinates.lng], 14, {
      duration: 0.75,
    });
  }, [coordinates, map]);

  return null;
};

MapFocus.propTypes = {
  coordinates: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
};

const EventMap = ({ events, selectedEventId, onSelectEvent }) => {
  const selectedEvent = events.find((event) => event._id === selectedEventId);

  const initialCenter = selectedEvent
    ? [selectedEvent.location.coordinates.lat, selectedEvent.location.coordinates.lng]
    : events.length > 0
      ? [events[0].location.coordinates.lat, events[0].location.coordinates.lng]
      : DEFAULT_CENTER;

  const initialZoom = events.length > 0 ? 4 : DEFAULT_ZOOM;

  return (
    <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      scrollWheelZoom
      className="event-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selectedEvent && <MapFocus coordinates={selectedEvent.location.coordinates} />}
      {events.map((event) => {
        const {
          _id,
          title,
          location: {
            coordinates: { lat, lng },
            address,
            city,
            country,
          },
        } = event;

        const isActive = selectedEventId === _id;

        return (
          <Marker
            key={_id}
            position={[lat, lng]}
            icon={createMarkerIcon(isActive)}
            eventHandlers={{
              click: () => onSelectEvent?.(_id),
            }}
          >
            <Popup>
              <div className="event-map__popup">
                <h4>{title}</h4>
                <p>{address}</p>
                <p>{[city, country].filter(Boolean).join(', ')}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

EventMap.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      location: PropTypes.shape({
        address: PropTypes.string,
        city: PropTypes.string,
        country: PropTypes.string,
        coordinates: PropTypes.shape({
          lat: PropTypes.number.isRequired,
          lng: PropTypes.number.isRequired,
        }).isRequired,
      }).isRequired,
    }).isRequired,
  ).isRequired,
  selectedEventId: PropTypes.string,
  onSelectEvent: PropTypes.func,
};

export default EventMap;
