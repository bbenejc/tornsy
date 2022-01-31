import { ReactElement } from 'react';
import css from './menu.module.css';

export function WatchlistMenu({ small, onClose }: TProps): ReactElement {
  const classes = [css.Menu];
  if (small) classes.push(css.Small);

  return (
    <div className={classes.join(' ')}>
      <div className={css.Title}>Watchlist</div>
      <button
        className={css.Close}
        onClick={() => {
          if (onClose) onClose();
        }}
      >
        ×
      </button>
    </div>
  );
}

type TProps = {
  small: boolean;
  onClose?: () => void;
};
