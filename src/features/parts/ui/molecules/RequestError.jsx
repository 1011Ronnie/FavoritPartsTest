import { Button } from '@/shared/ui/atoms/Button';

import { getErrorMessage } from '@/features/parts/model/partsModel';

export function RequestError({ error, onRetry }) {
  if (error?.name === 'AbortError') {
    return null;
  }

  return (
    <div className="alert alert-danger" role="alert">
      <p className="mb-2">{getErrorMessage(error)}</p>
      <Button variant="outline-danger" size="sm" onClick={onRetry}>
        Повторить запрос
      </Button>
    </div>
  );
}
