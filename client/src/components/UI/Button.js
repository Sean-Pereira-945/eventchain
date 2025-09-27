import clsx from 'clsx';
import './Button.css';

const Button = ({ variant = 'primary', size = 'md', isLoading = false, children, icon: Icon, ...props }) => (
  <button className={clsx('btn', `btn--${variant}`, `btn--${size}`)} disabled={isLoading || props.disabled} {...props}>
    {isLoading && <span className="btn__spinner" />}
    {Icon && <Icon size={18} />}
    <span>{children}</span>
  </button>
);

export default Button;
