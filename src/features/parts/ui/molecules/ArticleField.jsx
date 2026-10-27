import { Input } from '@/shared/ui/atoms/Input';

export function ArticleField({ value, onChange }) {
  return (
    <div className="search-input mb-3">
      <label className="form-label" htmlFor="article">
        Артикул
      </label>
      <Input
        id="article"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Например, 7160500039S"
        autoComplete="off"
        spellCheck={false}
        aria-describedby="article-help"
      />
      <div className="form-text" id="article-help">
        Поиск начнётся автоматически после ввода.
      </div>
    </div>
  );
}
