export const SET_VISIBILITY = 'SET_VISIBILITY';
export const SET_ONLINE = 'SET_ONLINE';
export const SET_CONTEXT = 'SET_CONTEXT';
export const SET_STOCK = 'SET_STOCK';
export const SET_INTERVAL = 'SET_INTERVAL';
export const SET_VOLUME = 'SET_VOLUME';
export const SET_INDICATOR = 'SET_INDICATOR';
export const CREATE_INDICATOR = 'CREATE_INDICATOR';
export const REMOVE_INDICATOR = 'REMOVE_INDICATOR';
export const SET_ADVANCED = 'SET_ADVANCED';
export const CREATE_ADVANCED = 'CREATE_ADVANCED';
export const REMOVE_ADVANCED = 'REMOVE_ADVANCED';
export const UPDATE_ADVANCED = 'UPDATE_ADVANCED';
export const SET_THEME = 'SET_THEME';
export const SET_LIST = 'SET_LIST';
export const SET_OHLC = 'SET_OHLC';
export const START_FETCHING = 'START_FETCHING';
export const STOP_FETCHING = 'STOP_FETCHING';
export const ADD_FAVOURITE = 'ADD_FAVOURITES';
export const REMOVE_FAVOURITE = 'REMOVE_FAVOURITES';
export const SET_LIST_SORTING = 'SET_LIST_SORTING';
export const SET_LIST_COLUMNS = 'SET_LIST_COLUMNS';

export type TState = {
  visibility: boolean; // tab visibility
  online: boolean; // browser online param
  contextMenu: { position: number[]; which: string; data: any } | null;
  stock: string; // active stock (from url)
  interval: TInterval; // active interval (from url)
  volume: string; // #shares or marketcap as "volume" on chart
  indicators: TIndicator[]; // SMA / EMA lines on chart
  advanced?: TAdvanced; // advanced indicator
  theme: string; // light vs dark theme
  list: {
    data: TStockList[];
    lastUpdate: number;
  };
  ohlc: {
    [stock: string]: {
      [interval: string]: {
        data: TStockData[];
        loading: boolean;
        complete: boolean;
        lastUpdate: number;
        lastView: number;
      };
    };
  };
  // watchlist params
  listFavourites: string[]; // list of favourite stocks (always on top)
  listSorting: string; // how to sort the watchlist
  listColumns: string[]; // which columns to show
};

export type TAction =
  | { type: typeof SET_VISIBILITY; visibility: boolean }
  | { type: typeof SET_ONLINE; online: boolean }
  | { type: typeof SET_CONTEXT; position: number[]; which: string; data: any }
  | { type: typeof SET_STOCK; stock: string }
  | { type: typeof SET_INTERVAL; interval: TInterval }
  | { type: typeof SET_VOLUME; volume?: string }
  | { type: typeof SET_INDICATOR; index: number; indicator: TIndicator }
  | { type: typeof CREATE_INDICATOR }
  | { type: typeof REMOVE_INDICATOR; indicator: number }
  | { type: typeof SET_ADVANCED; advanced: TAdvanced }
  | { type: typeof CREATE_ADVANCED }
  | { type: typeof REMOVE_ADVANCED }
  | { type: typeof UPDATE_ADVANCED; key: string; value: number }
  | { type: typeof SET_THEME; theme: TState['theme'] }
  | { type: typeof SET_LIST; list: TStockList[]; timestamp: number }
  | {
      type: typeof SET_OHLC;
      stock: string;
      interval: TInterval;
      data: TAPIStockData[];
    }
  | {
      type: typeof START_FETCHING | typeof STOP_FETCHING;
      stock: string;
      interval: TInterval;
    }
  | { type: typeof ADD_FAVOURITE; favourite: string }
  | { type: typeof REMOVE_FAVOURITE; favourite: string }
  | { type: typeof SET_LIST_SORTING; order: string }
  | { type: typeof SET_LIST_COLUMNS; columns: string[] };
