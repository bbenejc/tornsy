import { ReactElement, useCallback, MouseEvent, memo } from 'react';
import css from './menu.module.css';

const intervals = ['m1', 'm5', 'h1', 'd0'];

function Menu(): ReactElement {
  const changeInterval = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    console.log(e.currentTarget.value);
  }, []);

  return (
    <div className={css.Menu}>
      <div>
        {intervals.map((i) => (
          <button key={i} value={i} onClick={changeInterval}>
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}

export const WatchlistMenu = memo(Menu);
