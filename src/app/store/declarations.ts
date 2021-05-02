export const SET_LIST = "SET_LIST";
export const SET_LIST_ORDER = "SET_LIST_ORDER";
export const SET_THEME = "SET_THEME";

export type TState = {
  list: TStockInfo[];
  listOrder: string;
  theme: string;
};

export type TAction =
  | { type: typeof SET_LIST; list: TStockInfo[] }
  | { type: typeof SET_LIST_ORDER; order: string }
  | { type: typeof SET_THEME; theme: TState["theme"] };
