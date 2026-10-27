import { useCallback, useEffect, useRef, useState } from 'react'
import { getApiKey, useLazyGetManufacturersQuery, useLazyGetOffersQuery } from './partsApi'

export const DEBOUNCE_DELAY = 400

function cancelRequest(ref) {
  ref.current?.abort()
  ref.current?.unsubscribe()
  ref.current = null
}

export function usePartsSearch() {
  const [article, setArticle] = useState('')
  const [brand, setBrand] = useState('')
  const [manufacturersId, setManufacturersId] = useState(null)
  const [offersId, setOffersId] = useState(null)
  const [findManufacturers, manufacturersResult] = useLazyGetManufacturersQuery()
  const [findOffers, offersResult] = useLazyGetOffersQuery()
  const manufacturersRequest = useRef(null)
  const offersRequest = useRef(null)
  const timer = useRef(null)
  const configured = Boolean(getApiKey())
  const number = article.trim()

  const startManufacturers = useCallback((value) => {
    cancelRequest(manufacturersRequest)
    const request = findManufacturers(value)
    manufacturersRequest.current = request
    setManufacturersId(request.requestId)
  }, [findManufacturers])

  useEffect(() => {
    if (!configured || !number) return
    const timeout = setTimeout(() => startManufacturers(number), DEBOUNCE_DELAY)
    timer.current = timeout
    return () => clearTimeout(timeout)
  }, [article, number, configured, startManufacturers])

  useEffect(() => () => {
    clearTimeout(timer.current)
    cancelRequest(manufacturersRequest)
    cancelRequest(offersRequest)
  }, [])

  function changeArticle(value) {
    clearTimeout(timer.current)
    cancelRequest(manufacturersRequest)
    cancelRequest(offersRequest)
    setArticle(value)
    setBrand('')
    setManufacturersId(null)
    setOffersId(null)
  }

  function selectBrand(value) {
    if (!configured || !number) return
    cancelRequest(offersRequest)
    setBrand(value)
    const request = findOffers({ number, brand: value })
    offersRequest.current = request
    setOffersId(request.requestId)
  }

  const manufacturers = manufacturersId && manufacturersResult.requestId === manufacturersId
    && manufacturersResult.originalArgs === number ? manufacturersResult : null
  const offers = offersId && offersResult.requestId === offersId
    && offersResult.originalArgs?.number === number && offersResult.originalArgs?.brand === brand
    ? offersResult : null

  return {
    article, number, brand, configured, manufacturers, offers,
    waiting: Boolean(number && configured && !manufacturersId),
    manufacturersPending: Boolean(manufacturersId && (!manufacturers || manufacturers.isFetching)),
    offersPending: Boolean(offersId && (!offers || offers.isFetching)),
    changeArticle,
    selectBrand,
    retryManufacturers: () => startManufacturers(number),
    retryOffers: () => selectBrand(brand),
  }
}
