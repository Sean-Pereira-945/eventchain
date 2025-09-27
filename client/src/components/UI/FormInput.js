import clsx from 'clsx';
import './FormInput.css';

const FormInput = ({ label, error, helperText, icon: Icon, className, ...props }) => (
  <label className={clsx('form-field', className)}>
    {label && <span className="form-field__label">{label}</span>}
    <div className="form-field__control">
      {Icon && <Icon size={18} className="form-field__icon" />}
      <input className={clsx('form-field__input', error && 'has-error')} {...props} />
    </div>
    {(helperText || error) && <small className={clsx('form-field__helper', error && 'has-error')}>{error || helperText}</small>}
  </label>
);

export default FormInput;
