import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { worker } from "config";
import { setStocksList } from "app/store";

export function useStocks(): void {
  const dispatch = useDispatch();

  useEffect(() => {
    function loadStocks() {
      fetchStocks()
        .then(({ data, timestamp }) => {
          const stocks: TStockInfo[] = [];
          data.forEach(({ stock, name, price, price_m1, total_shares }) => {
            const cur = parseFloat(price);
            const prev = parseFloat(price_m1);
            stocks.push({
              stock,
              name,
              price,
              diff_m1: cur - prev,
              diff_percent_m1: ((cur - prev) / prev) * 100,
              total_shares,
            });
          });
          dispatch(setStocksList(stocks, timestamp));
        })
        .catch(() => {})
        .finally(() => {
          const timeNext = new Date();
          timeNext.setMinutes(timeNext.getMinutes() + 1, 3, 0);
          const interval = Math.max(5000, timeNext.getTime() - Date.now());
          worker.postMessage({ set: "stocks", interval });
        });
    }

    const onMessage = (e: MessageEvent) => {
      if (e.data.tick === "stocks") loadStocks();
    };
    worker.addEventListener("message", onMessage);

    loadStocks();

    return () => {
      worker.removeEventListener("message", onMessage);
      worker.postMessage({ clear: "stocks" });
    };
  }, [dispatch]);
}

async function fetchStocks(): Promise<{
  data: TStockList[];
  timestamp: number;
}> {
  const res = await fetch(process.env.REACT_APP_API + "/stocks").then(
    (response) => response.json()
  );
  const data = res && res.data ? res.data : [];
  const timestamp = res && res.timestamp ? res.timestamp : 0;

  return { data, timestamp };
}
