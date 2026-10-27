import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getApiKey,
  useLazyGetManufacturersQuery,
  useLazyGetOffersQuery,
} from './partsApi';

export const DEBOUNCE_DELAY = 400;

export function usePartsSearch() {
  const [articleInput, setArticleInput] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [manufacturersRequestId, setManufacturersRequestId] = useState(null);
  const [offersRequestId, setOffersRequestId] = useState(null);

  const [fetchManufacturers, manufacturersQueryResult] =
    useLazyGetManufacturersQuery();
  const [fetchOffers, offersQueryResult] = useLazyGetOffersQuery();

  const manufacturersRequestRef = useRef(null);
  const offersRequestRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const isConfigured = Boolean(getApiKey());
  const articleNumber = articleInput.trim();
  const manufacturersQuery =
    manufacturersRequestId &&
    manufacturersQueryResult.requestId === manufacturersRequestId &&
    manufacturersQueryResult.originalArgs === articleNumber
      ? manufacturersQueryResult
      : null;
  const offersQuery =
    offersRequestId &&
    offersQueryResult.requestId === offersRequestId &&
    offersQueryResult.originalArgs?.number === articleNumber &&
    offersQueryResult.originalArgs?.brand === selectedBrand
      ? offersQueryResult
      : null;

  const startManufacturersSearch = useCallback(
    (number) => {
      cancelRequest(manufacturersRequestRef);

      const request = fetchManufacturers(number);
      manufacturersRequestRef.current = request;
      setManufacturersRequestId(request.requestId);
    },
    [fetchManufacturers],
  );

  function handleArticleChange(nextArticleInput) {
    clearTimeout(debounceTimerRef.current);
    cancelRequest(manufacturersRequestRef);
    cancelRequest(offersRequestRef);

    setArticleInput(nextArticleInput);
    setSelectedBrand('');
    setManufacturersRequestId(null);
    setOffersRequestId(null);
  }

  function handleBrandSelect(brand) {
    if (!isConfigured || !articleNumber) {
      return;
    }

    cancelRequest(offersRequestRef);
    setSelectedBrand(brand);

    const request = fetchOffers({ number: articleNumber, brand });
    offersRequestRef.current = request;
    setOffersRequestId(request.requestId);
  }

  function handleManufacturersRetry() {
    startManufacturersSearch(articleNumber);
  }

  function handleOffersRetry() {
    handleBrandSelect(selectedBrand);
  }

  // Every edit cancels the timer, including changes to outer whitespace only.
  useEffect(() => {
    if (!isConfigured || !articleNumber) {
      return;
    }

    const timeout = setTimeout(
      () => startManufacturersSearch(articleNumber),
      DEBOUNCE_DELAY,
    );
    debounceTimerRef.current = timeout;
    return () => clearTimeout(timeout);
  }, [articleInput, articleNumber, isConfigured, startManufacturersSearch]);

  useEffect(
    () => () => {
      clearTimeout(debounceTimerRef.current);
      cancelRequest(manufacturersRequestRef);
      cancelRequest(offersRequestRef);
    },
    [],
  );

  return {
    articleInput,
    articleNumber,
    selectedBrand,
    isConfigured,
    manufacturersQuery,
    offersQuery,
    isWaitingForInput: Boolean(
      articleNumber && isConfigured && !manufacturersRequestId,
    ),
    isManufacturersPending: Boolean(
      manufacturersRequestId &&
      (!manufacturersQuery || manufacturersQuery.isFetching),
    ),
    isOffersPending: Boolean(
      offersRequestId && (!offersQuery || offersQuery.isFetching),
    ),
    handleArticleChange,
    handleBrandSelect,
    handleManufacturersRetry,
    handleOffersRetry,
  };
}

function cancelRequest(requestRef) {
  requestRef.current?.abort();
  requestRef.current?.unsubscribe();
  requestRef.current = null;
}
