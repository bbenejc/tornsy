import React, { ReactElement, useEffect, useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { use100vh } from 'react-div-100vh';
import { useStocks, useQueryParams } from 'hooks';
import { selectTheme, setOnline, setVisibility } from 'app/store';
import { SMALL } from 'config';
import { Chart, Menu, Watchlist, Status } from 'components';
import './app.css';

export function App(): ReactElement {
  const store = useStore();
  const [width, setWidth] = useState(window.innerWidth);
  const theme = useSelector(selectTheme);
  const height = use100vh() || 0;

  // window resize handler
  useEffect(() => {
    const onResize = () => {
      setWidth(window.innerWidth);
    };
    const onOnline = () => store.dispatch(setOnline(window.navigator.onLine));
    const onVisibility = () => {
      store.dispatch(setVisibility(document.visibilityState === 'visible'));
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOnline);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOnline);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [store]);

  const appCss = ['App', theme];
  const isSmall = width < SMALL;
  if (isSmall) appCss.push('small');

  return (
    <>
      <CheckRedirect />
      <div className={appCss.join(' ')} style={{ height }}>
        <div className="Main">
          <Menu width={width} height={height} />
          {height > 0 && <Chart height={height - 40} width={isSmall ? width : width - 350} />}
        </div>
        {height > 0 && !isSmall && <Watchlist />}
        <Status />
      </div>
    </>
  );
}

function CheckRedirect(): ReactElement {
  useStocks();
  const redirect = useQueryParams();
  return redirect ? <Redirect to={redirect} /> : <></>;
}
