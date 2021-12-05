export const SET_VISIBILITY = 'SET_VISIBILITY';
export const SET_ONLINE = 'SET_ONLINE';
export const SET_LIST = 'SET_LIST';
export const SET_OHLC = 'SET_OHLC';
export const START_FETCHING = 'START_FETCHING';
export const STOP_FETCHING = 'STOP_FETCHING';
export const SET_STOCK = 'SET_STOCK';
export const SET_INTERVAL = 'SET_INTERVAL';
export const SET_SORTING = 'SET_SORTING';
export const SET_THEME = 'SET_THEME';
export const CREATE_INDICATOR = 'CREATE_INDICATOR';
export const REMOVE_INDICATOR = 'REMOVE_INDICATOR';
export const SET_INDICATOR = 'SET_INDICATOR';
export const CREATE_ADVANCED = 'CREATE_ADVANCED';
export const REMOVE_ADVANCED = 'REMOVE_ADVANCED';
export const SET_ADVANCED = 'SET_ADVANCED';
export const UPDATE_ADVANCED = 'UPDATE_ADVANCED';
export const TOGGLE_VOLUME = 'TOGGLE_VOLUME';

export type TState = {
  visibility: boolean;
  online: boolean;
  stock: string;
  interval: TInterval;
  list: {
    data: TStockInfo[];
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
  sorting: string;
  theme: string;
  indicators: TIndicator[];
  advanced?: TAdvanced;
  volume: string;
};

export type TAction =
  | { type: typeof SET_ONLINE; online: boolean }
  | { type: typeof SET_VISIBILITY; visibility: boolean }
  | { type: typeof SET_LIST; list: TStockInfo[]; timestamp: number }
  | {
      type: typeof SET_OHLC;
      stock: string;
      interval: TInterval;
      data: TStockData[];
    }
  | {
      type: typeof START_FETCHING | typeof STOP_FETCHING;
      stock: string;
      interval: TInterval;
    }
  | { type: typeof SET_STOCK; stock: string }
  | { type: typeof SET_INTERVAL; interval: TInterval }
  | { type: typeof SET_SORTING; order: string }
  | { type: typeof SET_THEME; theme: TState['theme'] }
  | { type: typeof SET_INDICATOR; index: number; indicator: TIndicator }
  | { type: typeof CREATE_INDICATOR }
  | { type: typeof REMOVE_INDICATOR; indicator: number }
  | { type: typeof CREATE_ADVANCED }
  | { type: typeof REMOVE_ADVANCED }
  | { type: typeof SET_ADVANCED; advanced: TAdvanced }
  | { type: typeof UPDATE_ADVANCED; key: string; value: number }
  | { type: typeof TOGGLE_VOLUME; volume?: string };
