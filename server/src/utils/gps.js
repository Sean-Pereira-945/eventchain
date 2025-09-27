/**
 * Utility helpers for geospatial computations.
 */

const EARTH_RADIUS_METERS = 6371000; // Average earth radius in meters

/**
 * Calculates distance between two coordinates using the Haversine formula.
 */
const haversineDistance = (origin, destination) => {
  if (!origin || !destination) return Number.POSITIVE_INFINITY;

  const toRadians = (value) => (value * Math.PI) / 180;

  const lat1 = toRadians(origin.lat);
  const lat2 = toRadians(destination.lat);
  const deltaLat = toRadians(destination.lat - origin.lat);
  const deltaLng = toRadians(destination.lng - origin.lng);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
};

module.exports = {
  haversineDistance,
  EARTH_RADIUS_METERS,
};
