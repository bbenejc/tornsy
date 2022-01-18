import { SORTING } from 'config';
import { createSelector } from 'reselect';
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
export const selectStocksList = (state: TStore): TStockInfo[] => state.list.data;
export const selectStocksUpdated = (state: TStore): number => state.list.lastUpdate;
export const selectFavourites = (state: TStore): string[] => state.listFavourites;
export const selectListOrder = (state: TStore): string => state.listSorting;
export const selectListInterval = (state: TStore): string => state.listInterval;
export const selectListDiff = (state: TStore): string => state.listDiffType;
export const selectListSecondary = (state: TStore): string => state.listSecondaryMode;

// advanced selectors
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

export const selectStockPrice = createSelector(selectStock, selectStocksList, (stock, list) => {
  const info = list.find((s) => s.stock.toUpperCase() === stock.toUpperCase());
  return info ? info.price : '';
});

export const selectOrderedStocksList = createSelector(selectStocksList, selectListOrder, (stocks, order) => {
  let [sort, direction] = order.split('-');
  if (stocks.length && sort !== 'name' && !Object.keys(stocks[0]).includes(sort)) sort = 'name';

  return [...stocks].sort((a: TStockInfo, b: TStockInfo): number => {
    if (sort === 'name')
      return direction === SORTING[0] ? a.stock.localeCompare(b.stock) : b.stock.localeCompare(a.stock);
    else if (sort === 'price') {
      const lft = direction === SORTING[0] ? a : b;
      const rgt = direction === SORTING[0] ? b : a;
      return parseFloat(lft.price) - parseFloat(rgt.price);
    } else {
      // @ts-ignore
      return direction === SORTING[0] ? a[sort] - b[sort] : b[sort] - a[sort];
    }
  });
});
