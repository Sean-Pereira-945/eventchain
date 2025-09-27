import PropTypes from 'prop-types';
import Button from './Button';
import './ErrorState.css';

const ErrorState = ({ title, message, onRetry }) => (
  <div className="error-state" role="alert">
    <div className="error-state__glow" aria-hidden />
    <h2>{title}</h2>
    <p>{message}</p>
    {onRetry && (
      <Button size="sm" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);

ErrorState.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
};

export default ErrorState;
