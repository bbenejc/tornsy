import {
  SET_LIST,
  SET_LIST_ORDER,
  SET_THEME,
  CREATE_INDICATOR,
  REMOVE_INDICATOR,
  SET_INDICATOR,
  TState,
  TAction,
} from "./declarations";

export function setStocksList(list: TStockInfo[]): TAction {
  return { type: SET_LIST, list };
}

export function orderStocksList(order: string): TAction {
  return { type: SET_LIST_ORDER, order };
}

export function setTheme(theme: TState["theme"]): TAction {
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
