import { useEffect, useRef } from 'react';
import { useSelector, useStore } from 'react-redux';
import { UPDATE_SECOND } from 'config';
import { selectListIntervals, selectOnline, selectStocksUpdated, selectVisibility, setStocksList } from 'app/store';
import { parseFloatsListIntervals } from 'tools';

const worker = new Worker('/worker.js');

export function useStocks(): void {
  const store = useStore();
  const visibility = useSelector(selectVisibility);
  const online = useSelector(selectOnline);
  const intervals = useSelector(selectListIntervals);
  const prevIntervals = useRef(intervals);

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
      prevIntervals.current = intervals;
      fetchStocks(intervals)
        .then(({ data, timestamp }) => {
          const stocks: TStockList[] = [];
          data.forEach((stockData) => {
            const price = parseFloat(stockData.price);
            stocks.push({
              ...stockData,
              price,
              marketcap: stockData.marketcap ? stockData.marketcap : price * stockData.total_shares,
              interval: parseFloatsListIntervals(stockData.interval),
            });
          });

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
    if (lastUpdate > Date.now() - 60000 && includesAllIntervals(intervals, prevIntervals.current)) {
      scheduleStocksUpdate();
    } else loadStocks();

    return () => {
      worker.removeEventListener('message', onMessage);
      worker.postMessage({ clear: 'stocks' });
    };
  }, [store, visibility, online, intervals]);
}

// TODO: retry on fail
async function fetchStocks(intervals: string[]): Promise<{
  data: TAPIStockList[];
  timestamp: number;
}> {
  const params = intervals.length ? '?interval=' + intervals.join(',') : '';
  const res = await fetch(process.env.REACT_APP_API + '/stocks' + params).then((response) => response.json());
  const data = res && res.data ? res.data : [];
  const timestamp = res && res.timestamp ? res.timestamp : 0;

  return { data, timestamp };
}

function includesAllIntervals(current: string[], prev: string[]): boolean {
  for (let i = 0; i < current.length; i += 1) {
    if (!prev.includes(current[i])) return false;
  }
  return true;
}
