import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectOrderedStocksList } from "app/store";
import { getInterval, getStock, setStock, setInterval } from "tools";
import { INTERVALS } from "config";

export function useQueryParams(): TQueryParams {
  const stocks = useSelector(selectOrderedStocksList);
  const { stock = "", interval = "m1" } = useParams<TParams>();

  if (stocks.length) {
    const verifiedStock = verifyStock(stocks, [
      stock,
      getStock(),
      stocks[0].stock,
    ]);
    const verifiedInterval = verifyInterval(
      stock === "" ? getInterval() : interval
    );

    if (verifiedStock === stock) setStock(stock);
    if (verifiedInterval === interval) setInterval(interval);

    return {
      stock: verifiedStock,
      interval: verifiedInterval,
      redirect:
        verifiedStock === stock && verifiedInterval === interval
          ? ""
          : `/${verifiedStock}${
              verifiedInterval !== "m1" ? `/${verifiedInterval}` : ""
            }`,
    };
  } else
    return {
      stock: "",
      interval,
      redirect: "",
    };
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

type TQueryParams = TParams & { redirect: string };
