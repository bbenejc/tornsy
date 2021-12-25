import { ReactElement, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useStore } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { useStocks, useQueryParams } from 'hooks';
import { selectTheme, setOnline, setVisibility } from 'app/store';
import { SMALL } from 'config';
import { Chart, Menu, Watchlist, Status } from 'components';
import './app.css';

export function App(): ReactElement {
  const store = useStore();
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const theme = useSelector(selectTheme);

  useEffect(() => {
    const onResize = (e: Event) => {
      setTimeout(() => {
        ReactDOM.unstable_batchedUpdates(() => {
          setWidth(window.innerWidth);
          setHeight(window.innerHeight);
        });
      }, 10);
    };
    const onOnline = () => store.dispatch(setOnline(window.navigator.onLine));
    const onVisibility = () => {
      store.dispatch(setVisibility(document.visibilityState === 'visible'));
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOnline);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOnline);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [store]);

  const top = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab'));
  const bottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab'));

  const appCss = ['App', theme];
  const isSmall = width < SMALL;
  if (isSmall) appCss.push('small');

  return (
    <>
      <CheckRedirect />
      <div className={appCss.join(' ')} style={{ height }}>
        <div className="Main">
          <Menu width={width} height={height} />
          {height > 0 && <Chart height={height - 40 - bottom / 2} width={isSmall ? width : width - 350} />}
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
