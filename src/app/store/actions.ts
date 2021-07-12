import {
  SET_LIST,
  SET_LIST_ORDER,
  SET_THEME,
  CREATE_INDICATOR,
  REMOVE_INDICATOR,
  SET_INDICATOR,
  CREATE_ADVANCED,
  REMOVE_ADVANCED,
  SET_ADVANCED,
  TState,
  TAction,
  UPDATE_ADVANCED,
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
