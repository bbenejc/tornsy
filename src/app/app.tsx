import React, { ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, Redirect } from "react-router-dom";
import { use100vh } from "react-div-100vh";
import { useStocks } from "hooks";
import { selectOrderedStocksList, selectTheme } from "app/store";
import { Chart, Menu, Watchlist } from "components";
import "./app.css";

const SMALL = 860;

export function App(): ReactElement {
  useStocks();
  const [width, setWidth] = useState(window.innerWidth);
  const { stock = "", interval = "m1" } = useParams<TParams>();
  const theme = useSelector(selectTheme);
  const height = use100vh() || 0;

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
    <div className={appCss.join(" ")} style={{ height }}>
      <VerifyStock stock={stock} />
      <Menu stock={stock} interval={interval} width={width} height={height} />
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
  );
}

function VerifyStock({ stock }: TVerifyProps): ReactElement | null {
  const stocks = useSelector(selectOrderedStocksList);
  const match = stocks.find(
    (s) => s.stock.toUpperCase() === stock.toUpperCase()
  );

  if (stocks.length && (!match || match.stock.toLowerCase() !== stock)) {
    const redirect = match ? match.stock : stocks[0].stock;
    return <Redirect to={"/" + redirect.toLowerCase()} />;
  }

  return null;
}

type TParams = {
  stock: string;
  interval?: TInterval;
};

type TVerifyProps = {
  stock: string;
};
