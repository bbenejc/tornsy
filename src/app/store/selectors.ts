import { createSelector } from 'reselect';
import { TStore } from '.';

export const selectVisibility = (state: TStore): boolean => state.visibility;
export const selectOnline = (state: TStore): boolean => state.online;
export const selectStocksList = (state: TStore): TStockInfo[] => state.list.data;
export const selectStocksUpdated = (state: TStore): number => state.list.lastUpdate;
export const selectStockInfo =
  (stock: string) =>
  (state: TStore): TStockInfo | undefined => {
    return state.list.data.find((s) => s.stock.toUpperCase() === stock.toUpperCase());
  };
export const selectStockData =
  (stock: string, interval: TInterval) =>
  (state: TStore): TStore['ohlc'][string][TInterval] | undefined => {
    if (stock in state.ohlc && interval in state.ohlc[stock]) return state.ohlc[stock][interval];
    else return undefined;
  };

export const isFetchingStockData =
  (stock: string, interval: TInterval) =>
  (state: TStore): boolean => {
    if (stock in state.ohlc && interval in state.ohlc[stock]) return !!state.ohlc[stock][interval].loading;
    return false;
  };

export const selectStock = (state: TStore): string => state.stock;
export const selectIsActiveStock =
  (stock: string) =>
  (state: TStore): boolean =>
    state.stock === stock;
export const selectInterval = (state: TStore): TInterval => state.interval;

export const selectStocksListOrder = (state: TStore): string => state.sorting;
export const selectTheme = (state: TStore): string => state.theme;
export const selectIndicators = (state: TStore): TIndicator[] => state.indicators;
export const selectAdvanced = (state: TStore): TAdvanced | undefined => state.advanced;
export const selectVolume = (state: TStore): string => state.volume;

export const selectStockPrice = createSelector(selectStock, selectStocksList, (stock, list) => {
  const info = list.find((s) => s.stock.toUpperCase() === stock.toUpperCase());
  return info ? info.price : '';
});

export const selectOrderedStocksList = createSelector(selectStocksList, selectStocksListOrder, (stocks, order) => {
  const orderDirection = order.split('-');
  const item = orderDirection[0] as keyof typeof sortFunctions;
  const direction = orderDirection[1];

  return [...stocks].sort(sortFunctions[item](direction));
});

const sortFunctions = {
  name:
    (direction: string) =>
    (a: TStockInfo, b: TStockInfo): number => {
      return direction === 'asc' ? a.stock.localeCompare(b.stock) : b.stock.localeCompare(a.stock);
    },
  price:
    (direction: string) =>
    (a: TStockInfo, b: TStockInfo): number => {
      const lft = direction === 'asc' ? a : b;
      const rgt = direction === 'asc' ? b : a;
      return parseFloat(lft.price) - parseFloat(rgt.price);
    },
  diff:
    (direction: string) =>
    (a: TStockInfo, b: TStockInfo): number => {
      return direction === 'asc' ? a.price_diff - b.price_diff : b.price_diff - a.price_diff;
    },
  percent:
    (direction: string) =>
    (a: TStockInfo, b: TStockInfo): number => {
      return direction === 'asc' ? a.price_growth - b.price_growth : b.price_growth - a.price_growth;
    },
  marketcap:
    (direction: string) =>
    (a: TStockInfo, b: TStockInfo): number => {
      return direction === 'asc' ? a.marketcap - b.marketcap : b.marketcap - a.marketcap;
    },
};
