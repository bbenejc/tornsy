import React, { ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { use100vh } from "react-div-100vh";
import { useStocks, useQueryParams } from "hooks";
import { selectInterval, selectStock, selectTheme } from "app/store";
import { SMALL } from "config";
import { Chart, Menu, Watchlist } from "components";
import "./app.css";

export function App(): ReactElement {
  useStocks();
  const redirect = useQueryParams();
  const stock = useSelector(selectStock);
  const interval = useSelector(selectInterval);
  const [width, setWidth] = useState(window.innerWidth);
  const theme = useSelector(selectTheme);
  const height = use100vh() || 0;

  // window resize handler
  useEffect(() => {
    const onResize = () => {
      setWidth(window.innerWidth);
    };
    /*
    const onVisibility = () => {
      console.log(document.visibilityState);
    };
    */
    window.addEventListener("resize", onResize);
    // document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("resize", onResize);
      // document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const appCss = ["App", theme];
  if (width < SMALL) appCss.push("small");

  return (
    <>
      {redirect && <Redirect to={redirect} />}
      {!redirect && stock !== "" && (
        <div className={appCss.join(" ")} style={{ height }}>
          <Menu width={width} height={height} />
          {height > 0 && (
            <div className="Content">
              <Chart
                key={stock + interval}
                height={height - 40}
                width={width < SMALL ? width : width - 300}
              />
              {width >= SMALL && <Watchlist />}
            </div>
          )}
        </div>
      )}
    </>
  );
}
