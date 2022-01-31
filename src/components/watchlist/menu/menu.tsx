import { ReactElement, useCallback, MouseEvent, memo } from 'react';
import css from './menu.module.css';

function Menu(): ReactElement {
  return (
    <div className={css.Menu}>
      <div className={css.Title}>Watchlist</div>
    </div>
  );
}

export const WatchlistMenu = memo(Menu);
