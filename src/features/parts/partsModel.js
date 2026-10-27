function isPart(part) {
  return part && typeof part === 'object' && ['brand', 'number', 'name'].some(
    (field) => typeof part[field] === 'string' && part[field].trim(),
  )
}

export function uniqueManufacturers(goods) {
  return [...new Set(goods.filter(isPart).map((part) => part.brand).filter(
    (brand) => typeof brand === 'string' && brand.trim(),
  ))]
}

export function normalizeOffers(goods) {
  return goods.flatMap((part) => {
    if (!part || typeof part !== 'object') return []
    const analogues = Array.isArray(part.analogues) ? part.analogues : []
    return [
      ...(isPart(part) ? [{ ...part, kind: 'original' }] : []),
      ...analogues.filter(isPart).map((analogue) => ({ ...analogue, kind: 'analogue' })),
    ].map((item) => ({
      ...item,
      warehouses: Array.isArray(item.warehouses)
        ? item.warehouses.filter((warehouse) => warehouse && typeof warehouse === 'object' && !Array.isArray(warehouse))
        : [],
    }))
  })
}

const numberFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

export function formatNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? numberFormat.format(value) : '—'
}

const apiMessages = {
  'Empty key!': 'Сервис не получил ключ доступа. Проверьте настройку VITE_API_KEY.',
  'Invalid key client!': 'Неверный ключ доступа. Проверьте VITE_API_KEY.',
  'Empty number goods!': 'Сервис не получил артикул детали.',
  'Request quota exceeded!': 'Превышен лимит запросов к сервису. Повторите поиск позже.',
}

export function getErrorMessage(error) {
  if (error?.status === 'FETCH_ERROR') return 'Не удалось связаться с сервисом. Проверьте соединение и повторите запрос.'
  if (error?.status === 'TIMEOUT_ERROR') return 'Сервис не ответил за 20 секунд. Повторите запрос.'
  if (error?.status === 'PARSING_ERROR') return 'Сервис вернул ответ, который не удалось прочитать.'
  if (typeof error?.status === 'number') return `Ошибка сервиса (HTTP ${error.status}). Повторите запрос позже.`
  return apiMessages[error?.error] ?? error?.error ?? 'Не удалось выполнить запрос. Попробуйте ещё раз.'
}
