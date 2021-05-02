import {
  SET_LIST,
  SET_LIST_ORDER,
  SET_THEME,
  TState,
  TAction,
} from "./declarations";
import { getTheme, getListOrder, setTheme, setListOrder } from "tools";

const initialState: TState = {
  list: [],
  listOrder: getListOrder() || "price-desc",
  theme: getTheme() || "dark",
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

    default:
      return state;
  }
};
