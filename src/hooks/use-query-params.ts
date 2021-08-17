import { useParams } from "react-router-dom";
import { batch, useStore, useSelector } from "react-redux";
import { selectOrderedStocksList, setStock, setInterval } from "app/store";
import {
  getInterval,
  getStock,
  setStock as setStockLS,
  setInterval as setIntervalLS,
} from "tools";
import { INTERVALS } from "config";
import { useEffect, useState } from "react";

export function useQueryParams(): string {
  const store = useStore();
  const stocksLoaded = useSelector(selectOrderedStocksList).length > 0;
  const { stock = "", interval = "m1" } = useParams<TParams>();
  const [redirect, setRedirect] = useState("");

  useEffect(() => {
    const stocks = selectOrderedStocksList(store.getState());
    if (stocks.length) {
      const verifiedStock = verifyStock(stocks, [
        stock,
        getStock(),
        stocks[0].stock,
      ]);
      const verifiedInterval = verifyInterval(
        stock === "" ? getInterval() : interval
      );

      // save to local storage
      if (verifiedStock === stock) setStockLS(verifiedStock);
      if (verifiedInterval === interval) setIntervalLS(verifiedInterval);

      // save to redux store
      batch(() => {
        store.dispatch(setStock(verifiedStock));
        store.dispatch(setInterval(verifiedInterval));
      });

      setRedirect(
        verifiedStock === stock && verifiedInterval === interval
          ? ""
          : `/${verifiedStock}${
              verifiedInterval !== "m1" ? `/${verifiedInterval}` : ""
            }`
      );
    }
  }, [store, stocksLoaded, stock, interval]);

  return redirect;
}

function verifyStock(stocks: TStockInfo[], options: string[]): string {
  let stock = "";

  const findStock = (stock: string) =>
    stocks.find((s) => s.stock.toUpperCase() === stock.toUpperCase());

  for (let i = 0; i < options.length; i += 1) {
    const match = findStock(options[i]);
    if (match) {
      stock = match.stock.toLowerCase();
      break;
    }
  }

  return stock;
}

function verifyInterval(option: string): TInterval {
  if (option.toLowerCase() in INTERVALS)
    return option.toLowerCase() as TInterval;
  return "m1";
}

type TParams = {
  stock: string;
  interval: TInterval;
};
