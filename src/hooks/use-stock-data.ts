import { useCallback, useEffect, useState } from "react";
import { worker } from "config";

let cache: { [marketInterval: string]: TStockData } = {};
let historyReached: { [marketInterval: string]: boolean } = {};

export function useStockData(
  id: string,
  interval: TInterval
): [TStockData, (from: number) => void] {
  const [stock, setStock] = useState<TStockData>(
    cache[id + interval] || { stock: id, interval, data: [] }
  );

  useEffect(() => {
    const cacheKey = id + interval;
    function loadStock() {
      const cachedData = cache[cacheKey] ? cache[cacheKey].data : [];
      fetchStock(
        id,
        interval,
        cachedData.length ? cachedData[cachedData.length - 1][0] : 0
      )
        .then((data) => {
          if (data && data.data && data.data.length) {
            if (cache[cacheKey]) {
              if (
                cache[cacheKey].data[cache[cacheKey].data.length - 1][0] ===
                data.data[0][0]
              ) {
                cache[cacheKey].data.pop();
              }
              cache[cacheKey] = {
                stock: id,
                interval,
                // @ts-ignore
                data: [...cache[cacheKey].data, ...data.data],
              };
            } else cache[cacheKey] = data;
            setStock(cache[cacheKey]);
          }
        })
        .catch(() => {})
        .finally(() => {
          const timeNext = new Date();
          timeNext.setMinutes(
            timeNext.getMinutes() + (timeNext.getSeconds() >= 10 ? 1 : 0),
            10,
            0
          );
          const interval = Math.max(5000, timeNext.getTime() - Date.now());
          worker.postMessage({ set: id, interval });
        });
    }
    const onMessage = (e: MessageEvent) => {
      if (e.data.tick === id) loadStock();
    };
    worker.addEventListener("message", onMessage);

    loadStock();

    return () => {
      worker.removeEventListener("message", onMessage);
      worker.postMessage({ clear: id });
    };
  }, [id, interval]);

  const loadMore = useCallback(
    (from: number) => {
      const cacheKey = id + interval;
      if (cache[cacheKey]) {
        if (cache[cacheKey].data.length < 1000) historyReached[cacheKey] = true;
        if (
          !historyReached[cacheKey] &&
          cache[cacheKey] &&
          cache[cacheKey].data[500][0] >= from
        ) {
          historyReached[cacheKey] = true;
          fetchStock(id, interval, 0, cache[cacheKey].data[0][0])
            .then((data) => {
              if (data && data.data) {
                cache[cacheKey] = {
                  stock: id,
                  interval,
                  // @ts-ignore
                  data: [...data.data, ...cache[cacheKey].data],
                };
                setStock(cache[cacheKey]);

                if (data.data.length === 1000) historyReached[cacheKey] = false;
              }
            })
            .catch(() => {
              historyReached[cacheKey] = false;
            });
        }
      }
    },
    [id, interval]
  );

  return [stock, loadMore];
}

async function fetchStock(
  stock: string,
  interval: TInterval,
  from = 0,
  to = 0
): Promise<TStockData | null> {
  if (stock === "") return Promise.resolve(null);
  let url = process.env.REACT_APP_API + "/" + stock;
  const params = [];

  if (interval !== "m1") params.push("interval=" + interval);
  if (from > 0) params.push("from=" + (interval === "m1" ? from + 1 : from));
  if (to > 0) params.push("to=" + to);
  if (params.length > 0) url += "?" + params.join("&");
  const { data } = await fetch(url).then((response) => response.json());

  return { stock, interval, data };
}
