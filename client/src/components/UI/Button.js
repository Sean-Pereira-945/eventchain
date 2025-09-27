import clsx from 'clsx';
import './Button.css';

const Button = ({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}) => {
  const isButtonElement = Component === 'button';
  const mergedClassName = clsx('btn', `btn--${variant}`, `btn--${size}`, className, {
    'btn--loading': isLoading
  });

  const componentProps = {
    className: mergedClassName,
    ...rest
  };

  if (isButtonElement) {
    componentProps.type = type;
    componentProps.disabled = isLoading || disabled;
  } else if (isLoading || disabled) {
    componentProps['aria-disabled'] = true;
    componentProps.tabIndex = -1;
  }

  return (
    <Component {...componentProps}>
      {isLoading && <span className="btn__spinner" aria-hidden />}
      {Icon && <Icon size={18} aria-hidden />}
      <span>{children}</span>
    </Component>
  );
};

export default Button;
