import {
  SET_ONLINE,
  SET_VISIBILITY,
  SET_LIST,
  SET_OHLC,
  START_FETCHING,
  STOP_FETCHING,
  SET_STOCK,
  SET_INTERVAL,
  SET_SORTING,
  SET_THEME,
  CREATE_INDICATOR,
  REMOVE_INDICATOR,
  SET_INDICATOR,
  CREATE_ADVANCED,
  REMOVE_ADVANCED,
  SET_ADVANCED,
  UPDATE_ADVANCED,
  TState,
  TAction,
} from './declarations';

export function setOnline(online: boolean): TAction {
  return { type: SET_ONLINE, online };
}

export function setVisibility(visibility: boolean): TAction {
  return { type: SET_VISIBILITY, visibility };
}

export function setStocksList(list: TStockInfo[], timestamp: number): TAction {
  return { type: SET_LIST, list, timestamp };
}

export function setStockData(stock: string, interval: TInterval, data: TStockData[]): TAction {
  return { type: SET_OHLC, stock, interval, data };
}

export function setStock(stock: string): TAction {
  return { type: SET_STOCK, stock };
}

export function setInterval(interval: TInterval): TAction {
  return { type: SET_INTERVAL, interval };
}

export function setListSorting(order: string): TAction {
  return { type: SET_SORTING, order };
}

export function startFetching(stock: string, interval: TInterval): TAction {
  return { type: START_FETCHING, stock, interval };
}

export function stopFetching(stock: string, interval: TInterval): TAction {
  return { type: STOP_FETCHING, stock, interval };
}

export function setTheme(theme: TState['theme']): TAction {
  return { type: SET_THEME, theme };
}

export function createIndicator(): TAction {
  return { type: CREATE_INDICATOR };
}

export function removeIndicator(indicator: number): TAction {
  return { type: REMOVE_INDICATOR, indicator };
}

export function setIndicator(index: number, indicator: TIndicator): TAction {
  return { type: SET_INDICATOR, index, indicator };
}

export function createAdvanced(): TAction {
  return { type: CREATE_ADVANCED };
}

export function removeAdvanced(): TAction {
  return { type: REMOVE_ADVANCED };
}

export function setAdvanced(advanced: TAdvanced): TAction {
  return { type: SET_ADVANCED, advanced };
}

export function updateAdvanced(key: string, value: number): TAction {
  return { type: UPDATE_ADVANCED, key, value };
}
