import './LoadingSpinner.css';

const LoadingSpinner = ({ fullscreen = false, message = 'Loading...' }) => (
  <div className={`spinner ${fullscreen ? 'spinner--fullscreen' : ''}`} role="status" aria-live="polite">
    <div className="spinner__circle" />
    <span className="spinner__text">{message}</span>
  </div>
);

export default LoadingSpinner;
