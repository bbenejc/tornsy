import { useCallback, useEffect } from "react";
import { useSelector, useStore } from "react-redux";
import {
  isFetchingStockData,
  selectStockData,
  selectVisibility,
  setStockData,
  startFetching,
  stopFetching,
} from "app/store";
import { API_LIMIT } from "config";

export function useStockData(
  stock: string,
  interval: TInterval
): [TStockData[], (from: number) => void] {
  const store = useStore();
  const { data = [] } = useSelector(selectStockData(stock, interval)) || {};
  const visibility = useSelector(selectVisibility);

  useEffect(() => {
    const state = store.getState();
    const isFetching = isFetchingStockData(stock, interval)(state);
    if (!isFetching && visibility) {
      const { data = [], lastUpdate = 0 } =
        selectStockData(stock, interval)(state) || {};

      if (lastUpdate < Date.now() - 60000) {
        store.dispatch(startFetching(stock, interval));
        fetchStock(
          stock,
          interval,
          data.length > 0 ? data[data.length - 1][0] : 0
        )
          .then((data) => {
            if (data && data.length) {
              store.dispatch(setStockData(stock, interval, data));
            }
          })
          .catch(() => {
            store.dispatch(stopFetching(stock, interval));
          });
      }
    }
  }, [store, visibility, stock, interval]);

  const loadMore = useCallback(
    (from: number) => {
      const state = store.getState();
      const isFetching = isFetchingStockData(stock, interval)(state);
      const { data = [], complete = false } =
        selectStockData(stock, interval)(state) || {};

      if (
        !isFetching &&
        !complete &&
        data.length >= API_LIMIT &&
        data[API_LIMIT / 2][0] >= from
      ) {
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

  return [data, loadMore];
}

async function fetchStock(
  stock: string,
  interval: TInterval,
  from = 0,
  to = 0
): Promise<TStockData[] | null> {
  if (stock === "") return Promise.resolve(null);
  let url = process.env.REACT_APP_API + "/" + stock;
  const params = [];

  if (interval !== "m1") params.push("interval=" + interval);
  if (from > 0) params.push("from=" + (interval === "m1" ? from + 1 : from));
  if (to > 0) params.push("to=" + to);
  if (params.length > 0) url += "?" + params.join("&");
  const { data } = await fetch(url).then((response) => response.json());

  return data;
}
