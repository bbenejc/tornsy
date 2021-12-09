import { useEffect } from 'react';
import { useSelector, useStore } from 'react-redux';
import { UPDATE_SECOND, worker } from 'config';
import { selectOnline, selectStocksUpdated, selectVisibility, setStocksList } from 'app/store';

export function useStocks(): void {
  const store = useStore();
  const visibility = useSelector(selectVisibility);
  const online = useSelector(selectOnline);

  useEffect(() => {
    function scheduleStocksUpdate() {
      const timeNext = new Date();
      timeNext.setMinutes(timeNext.getMinutes() + (timeNext.getSeconds() >= 3 ? 1 : 0), UPDATE_SECOND, 0);
      worker.postMessage({
        set: 'stocks',
        interval: Math.max(0, timeNext.getTime() - Date.now()),
      });
    }
    function loadStocks() {
      fetchStocks()
        .then(({ data, timestamp }) => {
          const stocks: TStockInfo[] = [];
          data.forEach(
            // TODO: prev price + diff total_shares and marketcap calc
            ({ stock, name, price, price_m1, total_shares, marketcap }) => {
              const cur = parseFloat(price);
              const prev = parseFloat(price_m1);

              stocks.push({
                stock,
                name,
                price,
                price_diff: cur - prev,
                price_growth: ((cur - prev) / prev) * 100,
                marketcap: marketcap ? marketcap : parseFloat(price) * total_shares,
                marketcap_diff: 0,
                marketcap_growth: 0,
                total_shares,
              });
            }
          );
          store.dispatch(setStocksList(stocks, timestamp));
        })
        .catch(() => {})
        .finally(() => {
          scheduleStocksUpdate();
        });
    }

    const onMessage = (e: MessageEvent) => {
      if (online && e.data.tick === 'stocks') loadStocks();
    };
    worker.addEventListener('message', onMessage);

    const lastUpdate = selectStocksUpdated(store.getState());
    if (lastUpdate > Date.now() - 60000) scheduleStocksUpdate();
    else loadStocks();

    return () => {
      worker.removeEventListener('message', onMessage);
      worker.postMessage({ clear: 'stocks' });
    };
  }, [store, visibility, online]);
}

async function fetchStocks(): Promise<{
  data: TStockList[];
  timestamp: number;
}> {
  const res = await fetch(process.env.REACT_APP_API + '/stocks').then((response) => response.json());
  const data = res && res.data ? res.data : [];
  const timestamp = res && res.timestamp ? res.timestamp : 0;

  return { data, timestamp };
}
