export function Input({ className = '', ...inputProps }) {
  const inputClassName = ['form-control', className].filter(Boolean).join(' ');

  return <input className={inputClassName} {...inputProps} />;
}
