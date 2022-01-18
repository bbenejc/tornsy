import { ReactElement, MouseEvent, useEffect, useCallback, useState, useRef, CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addListFavourite, removeListFavourite, selectContextMenu, selectIsFavouriteStock } from 'app/store';
import css from './context-menu.module.css';

export function ContextMenu(): ReactElement | null {
  const info = useSelector(selectContextMenu);
  const [visible, setVisible] = useState(false);
  const styleRef = useRef<CSSProperties>({});
  useEffect(() => {
    if (info) {
      setVisible(true);
      const escKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setVisible(false);
      };
      document.addEventListener('keyup', escKey);

      return () => {
        document.removeEventListener('keyup', escKey);
      };
    }
  }, [info]);

  const clickAway = useCallback((e: MouseEvent) => {
    setVisible(false);
    e.stopPropagation();
  }, []);
  const prevent = useCallback((e: MouseEvent) => {
    e.preventDefault();
  }, []);

  const curtainCss = [css.Curtain];
  if (!visible) curtainCss.push(css.CurtainInactive);

  if (info) {
    styleRef.current = {
      left: Math.max(20, Math.min(info.position[0] - 90, window.innerWidth - 200)),
      top: Math.max(20, Math.min(info.position[1] + 10, window.innerHeight - 60)),
    };

    return (
      <div className={curtainCss.join(' ')} onClick={clickAway} onContextMenu={prevent}>
        <div className={css.Context} style={styleRef.current}>
          <Favourites stock={info.data} />
        </div>
      </div>
    );
  }

  return null;
}

function Favourites({ stock }: TFavouritesProps): ReactElement {
  const dispatch = useDispatch();
  const isFav = useSelector(selectIsFavouriteStock(stock));

  const toggleFavourite = () => {
    const action = !isFav ? addListFavourite : removeListFavourite;
    dispatch(action(stock));
  };

  return (
    <div onClick={toggleFavourite}>
      <svg viewBox="0 0 100 100">
        <use xlinkHref={`#icon-star${!isFav ? '_outline' : ''}`} />
      </svg>
      <span>{isFav ? 'Remove from' : 'Add to'} favourites</span>
    </div>
  );
}

type TFavouritesProps = {
  stock: string;
};
