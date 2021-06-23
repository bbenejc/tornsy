import React, { ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, Redirect } from "react-router-dom";
import { use100vh } from "react-div-100vh";
import { useStocks } from "hooks";
import { selectOrderedStocksList, selectTheme } from "app/store";
import { getInterval, getStock, setStock, setInterval } from "tools";
import { INTERVALS } from "config";
import { Chart, Menu, Watchlist } from "components";
import "./app.css";

const SMALL = 860;

export function App(): ReactElement {
  useStocks();
  const { stock, interval, redirect } = useQueryParams();
  const [width, setWidth] = useState(window.innerWidth);
  const theme = useSelector(selectTheme);
  const height = use100vh() || 0;

  // window resize handler
  useEffect(() => {
    const onResize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const appCss = ["App", theme];
  if (width < SMALL) appCss.push("small");

  return (
    <>
      {redirect && <Redirect to={redirect} />}
      {!redirect && stock !== "" && (
        <div className={appCss.join(" ")} style={{ height }}>
          <Menu
            stock={stock}
            interval={interval}
            width={width}
            height={height}
          />
          {height > 0 && (
            <div className="Content">
              <Chart
                key={stock + interval}
                stock={stock}
                interval={interval}
                height={height - 40}
                width={width < SMALL ? width : width - 300}
              />
              {width >= SMALL && <Watchlist interval={interval} />}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function useQueryParams(): TQueryParams {
  const stocks = useSelector(selectOrderedStocksList);
  const { stock = "", interval = "m1" } = useParams<TParams>();

  if (stocks.length) {
    const verifiedStock = verifyStock(stocks, [stock, getStock()]);
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
