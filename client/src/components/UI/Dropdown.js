import { useMemo } from 'react';
import clsx from 'clsx';
import './Dropdown.css';

const Dropdown = ({ label, options = [], value, onChange, placeholder = 'Select...', ...props }) => {
  const fallbackId = useMemo(() => `dropdown-${Math.random().toString(36).slice(2)}`, []);

  return (
    <label className="dropdown" htmlFor={fallbackId}>
      {label && <span className="dropdown__label">{label}</span>}
      <select
        id={fallbackId}
        className={clsx('dropdown__select')}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default Dropdown;
