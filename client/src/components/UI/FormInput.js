import { forwardRef } from 'react';
import clsx from 'clsx';
import './FormInput.css';

const FormInput = forwardRef(({ label, error, helperText, icon: Icon, className, inputClassName, ...props }, ref) => (
  <label className={clsx('form-field', className)}>
    {label && <span className="form-field__label">{label}</span>}
    <div className="form-field__control">
      {Icon && <Icon size={18} className="form-field__icon" aria-hidden />}
      <input ref={ref} className={clsx('form-field__input', error && 'has-error', inputClassName)} {...props} />
    </div>
    {(helperText || error) && <small className={clsx('form-field__helper', error && 'has-error')}>{error || helperText}</small>}
  </label>
));

FormInput.displayName = 'FormInput';

export default FormInput;
