import { useCallback, useEffect } from 'react';
import { useSelector, useStore } from 'react-redux';
import {
  isFetchingStockData,
  selectOnline,
  selectStockData,
  selectVisibility,
  setStockData,
  startFetching,
  stopFetching,
} from 'app/store';
import { EMPTY_ARRAY } from 'tools';
import { API_LIMIT } from 'config';

const API_PREFETCH = Math.round(API_LIMIT * 0.65);

export function useStockData(stock: string, interval: TInterval): [TStockData[], null | ((from: number) => void)] {
  const store = useStore();
  const stockData = useSelector(selectStockData(stock, interval));
  const visibility = useSelector(selectVisibility);
  const online = useSelector(selectOnline);

  useEffect(() => {
    const state = store.getState();
    const isFetching = isFetchingStockData(stock, interval)(state);
    if (!isFetching && visibility && online) {
      const { data = [], lastUpdate = 0 } = selectStockData(stock, interval)(state) || {};

      if (lastUpdate < Date.now() - 60000) {
        store.dispatch(startFetching(stock, interval));
        fetchStock(stock, interval, data.length > 0 ? data[data.length - 1][0] : 0)
          .then((data) => {
            if (data && data.length) {
              store.dispatch(setStockData(stock, interval, data));
            } else store.dispatch(stopFetching(stock, interval));
          })
          .catch(() => {
            store.dispatch(stopFetching(stock, interval));
          });
      }
    }
  }, [store, visibility, online, stock, interval]);

  const loadMore = useCallback(
    (from: number) => {
      const state = store.getState();
      const isFetching = isFetchingStockData(stock, interval)(state);
      const isOnline = selectOnline(state);
      const { data = [], complete = false } = selectStockData(stock, interval)(state) || {};

      if (isOnline && !isFetching && !complete && data.length >= API_LIMIT && data[API_PREFETCH][0] >= from) {
        store.dispatch(startFetching(stock, interval));
        fetchStock(stock, interval, 0, data[0][0])
          .then((data) => {
            if (data && data.length) {
              store.dispatch(setStockData(stock, interval, data));
            }
          })
          .catch(() => {
            store.dispatch(stopFetching(stock, interval));
          });
      }
    },
    [store, stock, interval]
  );

  const data = stockData ? stockData.data : EMPTY_ARRAY;
  return [data, data.length ? loadMore : null];
}

async function fetchStock(stock: string, interval: TInterval, from = 0, to = 0): Promise<TStockData[] | null> {
  if (stock === '') return Promise.resolve(null);
  let url = process.env.REACT_APP_API + '/' + stock;
  const params = [];

  if (interval !== 'm1') params.push('interval=' + interval);
  if (from > 0) params.push('from=' + (interval === 'm1' ? from + 1 : from));
  if (to > 0) params.push('to=' + to);
  if (params.length > 0) url += '?' + params.join('&');
  const { data } = await fetch(url).then((response) => response.json());

  return data;
}
