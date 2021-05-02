import {
  SET_LIST,
  SET_LIST_ORDER,
  SET_THEME,
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
