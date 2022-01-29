import { SORTING } from 'config';
import { createSelector } from 'reselect';
import { getColumnValue, parseColumn } from 'tools';
import { TStore } from '.';

// basic selectors
export const selectVisibility = (state: TStore): boolean => state.visibility;
export const selectOnline = (state: TStore): boolean => state.online;
export const selectContextMenu = (state: TStore): TStore['contextMenu'] => state.contextMenu;
export const selectStock = (state: TStore): string => state.stock;
export const selectInterval = (state: TStore): TInterval => state.interval;
export const selectVolume = (state: TStore): string => state.volume;
export const selectIndicators = (state: TStore): TIndicator[] => state.indicators;
export const selectAdvanced = (state: TStore): TAdvanced | undefined => state.advanced;
export const selectTheme = (state: TStore): string => state.theme;
export const selectStocksList = (state: TStore): TStockList[] => state.list.data;
export const selectStocksUpdated = (state: TStore): number => state.list.lastUpdate;
export const selectFavourites = (state: TStore): string[] => state.listFavourites;
export const selectListOrder = (state: TStore): string => state.listSorting;
export const selectListColumns = (state: TStore): string[] => state.listColumns;

// advanced selectors
export const selectListIntervals = createSelector(selectListColumns, (columns) => {
  const setIntervals = new Set<string>();
  columns.forEach((column) => {
    const { interval } = parseColumn(column);
    if (interval !== '') setIntervals.add(interval);
  });

  return Array.from(setIntervals);
});

export const selectIsActiveStock =
  (stock: string) =>
  (state: TStore): boolean =>
    state.stock === stock;

export const selectIsFavouriteStock =
  (stock: string) =>
  (state: TStore): boolean => {
    return !!state.listFavourites.find((s) => s.toUpperCase() === stock.toUpperCase());
  };

export const selectStockInfo =
  (stock: string) =>
  (state: TStore): TStockList | undefined => {
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

export const selectStockPrice = createSelector(selectStock, selectStocksList, (stock, list) => {
  const info = list.find((s) => s.stock.toUpperCase() === stock.toUpperCase());
  return info ? info.price : '';
});

export const selectOrderedStocksList = createSelector(selectStocksList, selectListOrder, (stocks, order) => {
  const [sort, direction] = order.split('-');

  return [...stocks].sort((a: TStockList, b: TStockList): number => {
    if (sort === 'name')
      return direction === SORTING[0] ? a.stock.localeCompare(b.stock) : b.stock.localeCompare(a.stock);
    else {
      const aValue = getColumnValue(a, sort)[0];
      const bValue = getColumnValue(b, sort)[0];
      return direction === SORTING[0] ? aValue - bValue : bValue - aValue;
    }
  });
});
