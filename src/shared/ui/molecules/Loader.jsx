import { Spinner } from '@/shared/ui/atoms/Spinner';

export function Loader({ children = 'Загрузка…' }) {
  return (
    <div
      className="d-flex align-items-center gap-2 text-secondary py-3"
      role="status"
    >
      <Spinner />
      <span>{children}</span>
    </div>
  );
}
