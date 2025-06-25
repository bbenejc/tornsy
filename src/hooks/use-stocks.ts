import { useEffect } from 'react';
import { useSelector, useStore } from 'react-redux';
import { UPDATE_SECOND } from 'config';
import {
  selectListIntervals,
  selectStocksIntervals,
  selectOnline,
  selectStocksUpdated,
  selectVisibility,
  setStocksList,
} from 'app/store';
import { parseFloatsListIntervals } from 'tools';
import { Store } from 'redux';

const worker = new Worker('/worker.js');
window.addEventListener('beforeunload', function () {
  worker.terminate();
});

export function useStocks(): void {
  const store = useStore();
  const visibility = useSelector(selectVisibility);
  const online = useSelector(selectOnline);
  const intervals = useSelector(selectListIntervals);

  useEffect(() => {
    function scheduleStocksUpdate(time = 0) {
      if (time === 0) {
        const timeNext = new Date();
        timeNext.setMinutes(timeNext.getMinutes() + (timeNext.getSeconds() >= UPDATE_SECOND ? 1 : 0), UPDATE_SECOND, 0);
        time = Math.max(0, timeNext.getTime() - Date.now());
      }
      worker.postMessage({
        set: 'stocks',
        interval: time,
      });
    }

    function loadStocks() {
      fetchStocks(filterIntervals(intervals, store))
        .then(({ data, intervals, timestamp }) => {
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

          store.dispatch(setStocksList(stocks, intervals, timestamp));
          scheduleStocksUpdate();
        })
        .catch(() => {
          scheduleStocksUpdate(3000);
        });
    }

    const onMessage = (e: MessageEvent) => {
      if (online && e.data.tick === 'stocks') loadStocks();
    };
    worker.addEventListener('message', onMessage);

    const lastUpdate = selectStocksUpdated(store.getState());
    if (lastUpdate > Date.now() - 60000 && filterIntervals(intervals, store).length === 0) {
      scheduleStocksUpdate();
    } else loadStocks();

    return () => {
      worker.removeEventListener('message', onMessage);
      worker.postMessage({ clear: 'stocks' });
    };
  }, [store, visibility, online, intervals]);
}

async function fetchStocks(reqIntervals: string[]): Promise<{
  data: TAPIStockList[];
  intervals: { [interval: string]: number };
  timestamp: number;
}> {
  const params = reqIntervals.length ? '?interval=' + reqIntervals.join(',') : '';
  const res = await fetch(process.env.REACT_APP_API + '/stocks' + params).then((response) => response.json());
  const data = res && res.data ? res.data : [];
  const timestamp = res && res.timestamp ? res.timestamp : 0;
  const intervals = res && res.intervals ? res.intervals : {};

  return { data, intervals, timestamp };
}

function filterIntervals(intervals: string[], store: Store): string[] {
  const now = Math.floor(Date.now() / 1000);
  const loadedIntervals = selectStocksIntervals(store.getState());
  const requiredIntervals: string[] = [];

  for (let i = 0; i < intervals.length; i += 1) {
    const interval = intervals[i];
    if (!loadedIntervals[interval] || loadedIntervals[interval] <= now) requiredIntervals.push(interval);
  }

  return requiredIntervals;
}
