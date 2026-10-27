import { getErrorMessage } from './partsModel';

export function RequestError({ error, onRetry }) {
  if (error?.name === 'AbortError') {
    return null;
  }
  return (
    <div className="alert alert-danger" role="alert">
      <p className="mb-2">{getErrorMessage(error)}</p>
      <button
        className="btn btn-outline-danger btn-sm"
        type="button"
        onClick={onRetry}
      >
        Повторить запрос
      </button>
    </div>
  );
}
