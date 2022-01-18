import {
  SET_VISIBILITY,
  SET_ONLINE,
  SET_CONTEXT,
  SET_STOCK,
  SET_INTERVAL,
  SET_VOLUME,
  SET_INDICATOR,
  CREATE_INDICATOR,
  REMOVE_INDICATOR,
  SET_ADVANCED,
  CREATE_ADVANCED,
  REMOVE_ADVANCED,
  UPDATE_ADVANCED,
  SET_THEME,
  SET_LIST,
  SET_OHLC,
  START_FETCHING,
  STOP_FETCHING,
  ADD_FAVOURITE,
  REMOVE_FAVOURITE,
  SET_LIST_SORTING,
  SET_LIST_INTERVAL,
  SET_LIST_DIFF,
  SET_LIST_SECONDARY,
  TState,
  TAction,
} from './declarations';

export function setVisibility(visibility: boolean): TAction {
  return { type: SET_VISIBILITY, visibility };
}

export function setOnline(online: boolean): TAction {
  return { type: SET_ONLINE, online };
}

export function openContextMenu(position: number[], which: string, data: any): TAction {
  return { type: SET_CONTEXT, position, which, data };
}

export function setStock(stock: string): TAction {
  return { type: SET_STOCK, stock };
}

export function setInterval(interval: TInterval): TAction {
  return { type: SET_INTERVAL, interval };
}

export function setVolume(volume?: string): TAction {
  return { type: SET_VOLUME, volume };
}

export function setIndicator(index: number, indicator: TIndicator): TAction {
  return { type: SET_INDICATOR, index, indicator };
}

export function createIndicator(): TAction {
  return { type: CREATE_INDICATOR };
}

export function removeIndicator(indicator: number): TAction {
  return { type: REMOVE_INDICATOR, indicator };
}

export function setAdvanced(advanced: TAdvanced): TAction {
  return { type: SET_ADVANCED, advanced };
}

export function createAdvanced(): TAction {
  return { type: CREATE_ADVANCED };
}

export function removeAdvanced(): TAction {
  return { type: REMOVE_ADVANCED };
}

export function updateAdvanced(key: string, value: number): TAction {
  return { type: UPDATE_ADVANCED, key, value };
}

export function setTheme(theme: TState['theme']): TAction {
  return { type: SET_THEME, theme };
}

export function setStocksList(list: TStockInfo[], timestamp: number): TAction {
  return { type: SET_LIST, list, timestamp };
}

export function setStockData(stock: string, interval: TInterval, data: TStockData[]): TAction {
  return { type: SET_OHLC, stock, interval, data };
}

export function startFetching(stock: string, interval: TInterval): TAction {
  return { type: START_FETCHING, stock, interval };
}

export function stopFetching(stock: string, interval: TInterval): TAction {
  return { type: STOP_FETCHING, stock, interval };
}

export function addListFavourite(favourite: string): TAction {
  return { type: ADD_FAVOURITE, favourite };
}

export function removeListFavourite(favourite: string): TAction {
  return { type: REMOVE_FAVOURITE, favourite };
}

export function setListSorting(order: string): TAction {
  return { type: SET_LIST_SORTING, order };
}

export function setListInterval(interval: string): TAction {
  return { type: SET_LIST_INTERVAL, interval };
}

export function setListDiff(diff: string): TAction {
  return { type: SET_LIST_DIFF, diff };
}

export function setListSecondary(secondary: string): TAction {
  return { type: SET_LIST_SECONDARY, secondary };
}
