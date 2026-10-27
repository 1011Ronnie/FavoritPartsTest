export function ApiKeyNotice() {
  return (
    <div className="alert alert-warning" role="alert">
      Для поиска укажите <code>VITE_API_KEY</code> в файле <code>.env</code> и
      перезапустите приложение.
    </div>
  );
}
