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
import {
  getTheme,
  getListOrder,
  setTheme,
  setListOrder,
  getIndicators,
  setIndicators,
} from "tools";

const initialState: TState = {
  list: [],
  listOrder: getListOrder() || "price-desc",
  theme: getTheme() || "dark",
  indicators: getIndicators(),
};

export const reducer = (state = initialState, action: TAction): TState => {
  switch (action.type) {
    case SET_LIST:
      return { ...state, list: action.list };

    case SET_LIST_ORDER: {
      const [curField, curDirection] = state.listOrder.split("-");
      const newOrder = [action.order];
      if (curField === action.order)
        newOrder.push(curDirection === "asc" ? "desc" : "asc");
      else newOrder.push(action.order === "name" ? "asc" : "desc");

      const listOrder = newOrder.join("-");
      setListOrder(listOrder);

      return { ...state, listOrder };
    }

    case SET_THEME:
      setTheme(action.theme);
      return { ...state, theme: action.theme };

    case CREATE_INDICATOR: {
      if (state.indicators.length < 2) {
        const indicators = [...state.indicators];
        indicators.push({
          type:
            indicators.length === 0 || indicators[0].type === "ema"
              ? "sma"
              : "ema",
          length: indicators.length === 0 ? 12 : indicators[0].length,
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

    default:
      return state;
  }
};
