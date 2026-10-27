export function Button({
  children,
  variant = 'primary',
  size,
  type = 'button',
  className = '',
  ...buttonProps
}) {
  const buttonClassName = [
    'btn',
    'btn-' + variant,
    size && 'btn-' + size,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={buttonClassName} {...buttonProps}>
      {children}
    </button>
  );
}
