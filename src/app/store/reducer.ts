import {
  SET_LIST,
  SET_OHLC,
  SET_STOCK,
  SET_INTERVAL,
  SET_SORTING,
  SET_THEME,
  CREATE_INDICATOR,
  REMOVE_INDICATOR,
  SET_INDICATOR,
  SET_ADVANCED,
  REMOVE_ADVANCED,
  CREATE_ADVANCED,
  UPDATE_ADVANCED,
  START_FETCHING,
  STOP_FETCHING,
  TState,
  TAction,
} from "./declarations";
import {
  getTheme,
  getListOrder,
  setTheme,
  setListOrder,
  getIndicators,
  setIndicators,
  getAdvanced,
  setAdvanced,
} from "tools";
import { API_LIMIT, INDICATORS_ADVANCED } from "config";
import { getInterval } from "tools/intervals";

const initialState: TState = {
  stock: "",
  interval: "m1",
  list: [],
  ohlc: {},
  sorting: getListOrder() || "price-desc",
  theme: getTheme() || "dark",
  indicators: getIndicators(),
  advanced: getAdvanced(),
};

export const reducer = (state = initialState, action: TAction): TState => {
  switch (action.type) {
    case SET_LIST: {
      const { list, timestamp } = action;
      const ohlc = { ...state.ohlc };

      // update list
      const now = Date.now();

      // update all OHLCV data
      for (const stock in ohlc) {
        ohlc[stock] = { ...ohlc[stock] };
        for (const interval in ohlc[stock]) {
          if (
            ohlc[stock][interval].data &&
            !ohlc[stock][interval].loading &&
            ohlc[stock][interval].lastUpdate >= now - 65000
          ) {
            const data = {
              ...ohlc[stock][interval],
              data: [...(ohlc[stock][interval].data || [])],
              lastUpdate: now,
            };
            const num = data.data.length;

            if (num > 0) {
              const info = list.find(
                (e) => e.stock.toUpperCase() === stock.toUpperCase()
              );
              if (info) {
                if (interval === "m1" && timestamp > data.data[num - 1][0]) {
                  data.data = [
                    ...data.data,
                    [timestamp, info.price, info.total_shares],
                  ];
                } else if (interval !== "m1") {
                  const i = getInterval(timestamp, interval as TInterval);
                  if (i === data.data[num - 1][0]) {
                    const [, o, h, l] = data.data[num - 1];
                    const hNum = parseFloat(h as string);
                    const lNum = parseFloat(l as string);
                    const priceNum = parseFloat(info.price);

                    data.data[num - 1] = [
                      i,
                      o,
                      hNum > priceNum ? h : info.price,
                      lNum < priceNum ? l : info.price,
                      info.price,
                      info.total_shares,
                    ] as TStockData;
                  } else if (i > data.data[num - 1][0]) {
                    data.data = [
                      ...data.data,
                      [
                        i,
                        info.price,
                        info.price,
                        info.price,
                        info.price,
                        info.total_shares,
                      ],
                    ];
                  }
                }
              }
              ohlc[stock][interval] = data;
            }
          }
        }
      }

      return { ...state, list, ohlc };
    }

    case SET_OHLC: {
      const { stock, interval, data: newData } = action;
      const lastUpdate = Date.now();
      const ohlc = { ...state.ohlc };

      if (
        newData.length > 0 &&
        ohlc[stock] &&
        ohlc[stock][interval] &&
        ohlc[stock][interval].loading
      ) {
        const curData = ohlc[stock][interval].data || [];
        ohlc[stock] = {
          ...ohlc[stock],
          [interval]: { ...ohlc[stock][interval], loading: false, lastUpdate },
        };
        if (curData.length === 0 || newData[0][0] < curData[0][0]) {
          ohlc[stock][interval].data = [
            ...newData,
            ...(ohlc[stock][interval].data || []),
          ];
          ohlc[stock][interval].complete = newData.length < API_LIMIT;
        } else {
        }

        return { ...state, ohlc };
      }

      return state;
    }

    case SET_STOCK:
      return { ...state, stock: action.stock };

    case SET_INTERVAL:
      return { ...state, interval: action.interval };

    case SET_SORTING: {
      const [curField, curDirection] = state.sorting.split("-");
      const newOrder = [action.order];
      if (curField === action.order)
        newOrder.push(curDirection === "asc" ? "desc" : "asc");
      else newOrder.push(action.order === "name" ? "asc" : "desc");

      const listOrder = newOrder.join("-");
      setListOrder(listOrder);

      return { ...state, sorting: listOrder };
    }

    case SET_THEME:
      setTheme(action.theme);
      return { ...state, theme: action.theme };

    case CREATE_INDICATOR: {
      if (state.indicators.length < 2) {
        const indicators = [...state.indicators];
        indicators.push({
          type: "sma",
          length:
            indicators.length === 0 || indicators[0].length > 50 ? 12 : 200,
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

    case START_FETCHING: {
      const { stock, interval } = action;

      const ohlc = { ...state.ohlc };
      ohlc[stock] = ohlc[stock] ? { ...ohlc[stock] } : {};
      ohlc[stock][interval] = ohlc[stock][interval]
        ? { ...ohlc[stock][interval], loading: true, lastUpdate: 0 }
        : { loading: true, lastUpdate: 0 };

      return { ...state, ohlc };
    }

    case STOP_FETCHING: {
      const { stock, interval } = action;

      const ohlc = { ...state.ohlc };
      ohlc[stock] = ohlc[stock] ? { ...ohlc[stock] } : {};
      ohlc[stock][interval] = ohlc[stock][interval]
        ? { ...ohlc[stock][interval], loading: false, lastUpdate: 0 }
        : { loading: false, lastUpdate: 0 };

      return { ...state, ohlc };
    }

    default:
      return state;
  }
};
