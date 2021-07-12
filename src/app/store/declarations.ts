export const SET_LIST = "SET_LIST";
export const SET_LIST_ORDER = "SET_LIST_ORDER";
export const SET_THEME = "SET_THEME";
export const CREATE_INDICATOR = "CREATE_INDICATOR";
export const REMOVE_INDICATOR = "REMOVE_INDICATOR";
export const SET_INDICATOR = "SET_INDICATOR";
export const CREATE_ADVANCED = "CREATE_ADVANCED";
export const REMOVE_ADVANCED = "REMOVE_ADVANCED";
export const SET_ADVANCED = "SET_ADVANCED";
export const UPDATE_ADVANCED = "UPDATE_ADVANCED";

export type TState = {
  list: TStockInfo[];
  listOrder: string;
  theme: string;
  indicators: TIndicator[];
  advanced?: TAdvanced;
};

export type TAction =
  | { type: typeof SET_LIST; list: TStockInfo[] }
  | { type: typeof SET_LIST_ORDER; order: string }
  | { type: typeof SET_THEME; theme: TState["theme"] }
  | { type: typeof SET_INDICATOR; index: number; indicator: TIndicator }
  | { type: typeof CREATE_INDICATOR }
  | { type: typeof REMOVE_INDICATOR; indicator: number }
  | { type: typeof CREATE_ADVANCED }
  | { type: typeof REMOVE_ADVANCED }
  | { type: typeof SET_ADVANCED; advanced: TAdvanced }
  | { type: typeof UPDATE_ADVANCED; key: string; value: number };
