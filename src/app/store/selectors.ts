import { createSelector } from "reselect";
import { TStore } from ".";

export const selectStocksList = (state: TStore): TStockInfo[] => state.list;
export const selectStockInfo =
  (stock: string) =>
  (state: TStore): TStockInfo | undefined => {
    return state.list.find(
      (s) => s.stock.toUpperCase() === stock.toUpperCase()
    );
  };

export const selectStocksListOrder = (state: TStore): string => state.listOrder;
export const selectTheme = (state: TStore): string => state.theme;
export const selectIndicators = (state: TStore): TIndicator[] =>
  state.indicators;

export const selectAdvanced = (state: TStore): TAdvanced | undefined =>
  state.advanced;

export const selectOrderedStocksList = createSelector(
  selectStocksList,
  selectStocksListOrder,
  (stocks, order) => {
    const orderDirection = order.split("-");
    const item = orderDirection[0] as keyof typeof sortFunctions;
    const direction = orderDirection[1];

    return [...stocks].sort(sortFunctions[item](direction));
  }
);

const sortFunctions = {
  name:
    (direction: string) =>
    (a: TStockInfo, b: TStockInfo): number => {
      return direction === "asc"
        ? a.stock.localeCompare(b.stock)
        : b.stock.localeCompare(a.stock);
    },
  price:
    (direction: string) =>
    (a: TStockInfo, b: TStockInfo): number => {
      const lft = direction === "asc" ? a : b;
      const rgt = direction === "asc" ? b : a;
      return parseFloat(lft.price) - parseFloat(rgt.price);
    },
  diff:
    (direction: string) =>
    (a: TStockInfo, b: TStockInfo): number => {
      return direction === "asc"
        ? a.diff_m1 - b.diff_m1
        : b.diff_m1 - a.diff_m1;
    },
  percent:
    (direction: string) =>
    (a: TStockInfo, b: TStockInfo): number => {
      return direction === "asc"
        ? a.diff_percent_m1 - b.diff_percent_m1
        : b.diff_percent_m1 - a.diff_percent_m1;
    },
};
