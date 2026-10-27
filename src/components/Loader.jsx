export function Loader({ children = 'Загрузка…' }) {
  return (
    <div
      className="d-flex align-items-center gap-2 text-secondary py-3"
      role="status"
    >
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
