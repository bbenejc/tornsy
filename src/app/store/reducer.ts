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
  SET_LIST_COLUMNS,
  TState,
  TAction,
} from './declarations';
import {
  getTheme,
  getListOrder,
  setTheme,
  setListOrder,
  getIndicators,
  setIndicators,
  getAdvanced,
  setAdvanced,
  getVolume,
  setVolume,
  getListFavourites,
  setListFavourites,
  getListColumns,
  setListColumns,
  EMPTY_ARRAY,
  parseFloatsData,
} from 'tools';
import { API_LIMIT, INDICATORS_ADVANCED, INDICATORS_MAX, VOLUME, SORTING } from 'config';
import { calculateInterval } from 'tools/intervals';

const initialState: TState = {
  visibility: document.visibilityState === 'visible',
  online: window.navigator.onLine,
  contextMenu: null,
  stock: '',
  interval: 'm1',
  volume: getVolume() || VOLUME[0][0],
  indicators: getIndicators(),
  advanced: getAdvanced(),
  theme: getTheme() || 'dark',
  list: { data: [], lastUpdate: 0, intervals: {} },
  ohlc: {},
  listFavourites: getListFavourites(),
  listSorting: getListOrder() || 'marketcap-desc',
  listColumns: getListColumns(),
};

if (!initialState.listColumns.includes(initialState.listSorting.split('-')[0])) {
  initialState.listSorting = 'marketcap-desc';
}

export const reducer = (state = initialState, action: TAction): TState => {
  switch (action.type) {
    case SET_ONLINE:
      return { ...state, online: action.online };

    case SET_VISIBILITY:
      return { ...state, visibility: action.visibility };

    case SET_CONTEXT:
      return { ...state, contextMenu: { position: action.position, which: action.which, data: action.data } };

    case SET_LIST: {
      const { list, intervals, timestamp } = action;
      const allIntervals: { [interval: string]: number } = {};
      const ohlc = { ...state.ohlc };

      // set expiry timestamps for new intervals
      for (const interval in intervals) {
        allIntervals[interval] = calculateInterval(timestamp, interval[0] + '1', 1);
      }

      // check for expired intervals and remove them
      const keepIntervals: string[] = [];
      for (const interval in state.list.intervals) {
        if (!(interval in intervals) && state.list.intervals[interval] > timestamp) {
          allIntervals[interval] = state.list.intervals[interval];
          keepIntervals.push(interval);
        }
      }

      // update list
      const now = Date.now();

      // update all OHLCV data
      for (const stock in ohlc) {
        ohlc[stock] = { ...ohlc[stock] };
        for (const interval in ohlc[stock]) {
          if (!ohlc[stock][interval].loading && ohlc[stock][interval].lastUpdate >= now - 65000) {
            const data: TState['ohlc'][string][TInterval] = {
              ...ohlc[stock][interval],
              data: [...ohlc[stock][interval].data],
              lastUpdate: now,
            };
            if (stock === state.stock && interval === state.interval) {
              data.lastView = now;
            } else {
              if (data.lastView < now - 15 * 60000) {
                // delete from cache completely if not viewed in last 15 minutes
                delete ohlc[stock][interval];
                continue;
              } else if (data.data.length > API_LIMIT) {
                // remove more than 1 fetch from cache if not currently active
                data.data = data.data.slice(-API_LIMIT);
                data.complete = false;
              }
            }
            const num = data.data.length;

            if (num > 0) {
              const info = list.find((e) => e.stock.toUpperCase() === stock.toUpperCase());
              if (info) {
                if (interval === 'm1' && timestamp > data.data[num - 1][0]) {
                  data.data = [...data.data, [timestamp, info.price, info.total_shares, info.marketcap]];
                } else if (interval !== 'm1') {
                  const i = calculateInterval(timestamp, interval);

                  if (i === data.data[num - 1][0]) {
                    const [, o, h, l] = data.data[num - 1];

                    data.data[num - 1] = [
                      i,
                      o,
                      h > info.price ? h : info.price,
                      l < info.price ? l : info.price,
                      info.price,
                      info.total_shares,
                      info.marketcap,
                    ] as TStockData;
                  } else if (i > data.data[num - 1][0]) {
                    data.data = [
                      ...data.data,
                      [i, info.price, info.price, info.price, info.price, info.total_shares, info.marketcap],
                    ];
                  }
                }
              }
              ohlc[stock][interval] = data;
            }
          }
        }
      }

      // keep previous non-expired intervals
      if (keepIntervals.length) {
        for (let i = 0; i < list.length; i += 1) {
          const old = state.list.data.find((s) => s.stock === list[i].stock);
          if (old) {
            keepIntervals.forEach((interval) => {
              if (old.interval[interval]) list[i].interval[interval] = old.interval[interval];
            });
          }
        }
      }

      return { ...state, list: { data: list, lastUpdate: now, intervals: allIntervals }, ohlc };
    }

    case SET_OHLC: {
      const { stock, interval, data } = action;
      const now = Date.now();
      const ohlc = { ...state.ohlc };
      const newData = parseFloatsData(data);

      if (newData.length > 0 && ohlc[stock] && ohlc[stock][interval] && ohlc[stock][interval].loading) {
        const curData = ohlc[stock][interval].data;
        ohlc[stock] = {
          ...ohlc[stock],
          [interval]: {
            ...ohlc[stock][interval],
            loading: false,
            lastUpdate: now,
            lastView: now,
          },
        };

        if (curData.length === 0 || newData[0][0] < curData[0][0]) {
          ohlc[stock][interval].data = [...newData, ...curData];
          ohlc[stock][interval].complete = newData.length < API_LIMIT;
        } else {
          if (curData[curData.length - 1][0] === newData[0][0]) curData.pop();
          ohlc[stock][interval].data = [...curData, ...newData];
        }

        return { ...state, ohlc };
      }

      return state;
    }

    case SET_STOCK:
      return { ...state, stock: action.stock };

    case SET_INTERVAL:
      return { ...state, interval: action.interval };

    case SET_THEME:
      setTheme(action.theme);
      return { ...state, theme: action.theme };

    case CREATE_INDICATOR: {
      if (state.indicators.length < INDICATORS_MAX) {
        const indicators = [...state.indicators];
        const num = indicators.length;
        const length = num % 2 === 0 ? 12 : 200;
        const type = num >= INDICATORS_MAX / 2 && indicators[0].type !== 'ema' ? 'ema' : 'sma';

        indicators.push({
          type,
          length,
        });
        setIndicators(indicators);
        return { ...state, indicators };
      }

      return state;
    }

    case SET_INDICATOR: {
      const { index, indicator } = action;
      const indicators = [...state.indicators];
      indicators[index] = indicator;
      setIndicators(indicators);
      return { ...state, indicators };
    }

    case REMOVE_INDICATOR: {
      const { indicator } = action;
      if (state.indicators.length >= indicator + 1) {
        const indicators = [...state.indicators];
        indicators.splice(indicator, 1);
        setIndicators(indicators);
        return { ...state, indicators };
      }

      return state;
    }

    case CREATE_ADVANCED: {
      const indicator = INDICATORS_ADVANCED[0];
      const advanced: any = { type: indicator.type };
      indicator.params.forEach(({ key, value }) => (advanced[key] = value));
      setAdvanced(advanced);

      return { ...state, advanced };
    }

    case SET_ADVANCED:
      setAdvanced(action.advanced);
      return { ...state, advanced: action.advanced };

    case REMOVE_ADVANCED: {
      const newState = { ...state };
      delete newState.advanced;
      setAdvanced();

      return newState;
    }

    case UPDATE_ADVANCED: {
      const { key, value } = action;
      if (state.advanced) {
        const advanced = { ...state.advanced, [key]: value };
        setAdvanced(advanced);
        return { ...state, advanced };
      } else return state;
    }

    case SET_VOLUME: {
      const volume = action.volume ? action.volume : state.volume === VOLUME[1][0] ? VOLUME[0][0] : VOLUME[1][0];
      setVolume(volume);
      return { ...state, volume };
    }

    case START_FETCHING: {
      const { stock, interval } = action;

      const ohlc = { ...state.ohlc };
      ohlc[stock] = ohlc[stock] ? { ...ohlc[stock] } : {};
      ohlc[stock][interval] = ohlc[stock][interval]
        ? { ...ohlc[stock][interval], loading: true }
        : {
            data: EMPTY_ARRAY,
            complete: false,
            loading: true,
            lastUpdate: 0,
            lastView: 0,
          };

      return { ...state, ohlc };
    }

    case STOP_FETCHING: {
      const { stock, interval } = action;

      const ohlc = { ...state.ohlc };
      ohlc[stock] = ohlc[stock] ? { ...ohlc[stock] } : {};
      ohlc[stock][interval] = ohlc[stock][interval]
        ? { ...ohlc[stock][interval], loading: false }
        : {
            data: EMPTY_ARRAY,
            complete: false,
            loading: false,
            lastUpdate: 0,
            lastView: 0,
          };

      return { ...state, ohlc };
    }

    case ADD_FAVOURITE: {
      const { favourite } = action;
      const favourites = getListFavourites();

      if (!favourites.includes(favourite)) {
        favourites.push(favourite);
        setListFavourites(favourites);
      }
      return { ...state, listFavourites: favourites };
    }

    case REMOVE_FAVOURITE: {
      const { favourite } = action;
      const favourites = getListFavourites();
      const index = favourites.indexOf(favourite);

      if (index >= 0) {
        favourites.splice(index, 1);
        setListFavourites(favourites);
      }
      return { ...state, listFavourites: favourites };
    }

    case SET_LIST_SORTING: {
      const [curField, curDirection] = state.listSorting.split('-');
      const newOrder = [action.order];
      if (curField === action.order) newOrder.push(curDirection === SORTING[0] ? SORTING[1] : SORTING[0]);
      else newOrder.push(action.order === 'name' ? SORTING[0] : SORTING[1]);

      const listOrder = newOrder.join('-');
      setListOrder(listOrder);

      return { ...state, listSorting: listOrder };
    }

    case SET_LIST_COLUMNS: {
      const { columns } = action;
      setListColumns(columns);
      return { ...state, listColumns: columns };
    }

    default:
      return state;
  }
};
