import { ReactElement, MouseEvent, useEffect, useCallback, useState, useRef, CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addListFavourite,
  removeListFavourite,
  selectContextMenu,
  selectIsFavouriteStock,
  selectListColumns,
  setListColumns,
} from 'app/store';
import css from './context-menu.module.css';
import { makeColumnString, parseColumn } from 'tools';
import { COLUMN_NAMES, LIST_INTERVALS } from 'config';
import { getIntervalName } from 'tools/intervals';

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
      left: Math.max(20, Math.min(info.position[0] - 100, window.innerWidth - 240)),
      top: Math.max(20, Math.min(info.position[1] + 10, window.innerHeight - 60)),
    };

    return (
      <div className={curtainCss.join(' ')} onClick={clickAway} onContextMenu={prevent}>
        <div className={css.Context} style={styleRef.current}>
          {info.which === 'favourites' && <Favourites stock={info.data} />}
          {info.which === 'header' && <Header column={info.data} />}
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
    <div className={css.List}>
      <div onClick={toggleFavourite}>
        <svg viewBox="0 0 100 100">
          <use xlinkHref={`#icon-star${!isFav ? '_outline' : ''}`} />
        </svg>
        <span>{isFav ? 'Remove from' : 'Add to'} favourites</span>
      </div>
    </div>
  );
}

function Header({ column }: THeaderProps): ReactElement {
  const dispatch = useDispatch();
  const columns = useSelector(selectListColumns);
  const { field, interval, type } = parseColumn(columns[column]);

  if (interval === '') {
    const ids = ['marketcap', 'total_shares'];
    const changeColumn = (col: string) => () => {
      if (col !== field) {
        const newColumns = [...columns];
        newColumns[column] = col;
        for (let i = column + 1; i < newColumns.length; i += 1) {
          const tmpCol = parseColumn(newColumns[i]);
          tmpCol.field = col as typeof tmpCol.field;
          newColumns[i] = makeColumnString(tmpCol);
        }
        dispatch(setListColumns(newColumns));
      }
    };

    return (
      <div className={css.List}>
        {ids.map((id) => (
          <div key={id} onClick={changeColumn(id)} className={field === id ? css.Active : ''}>
            {COLUMN_NAMES[id as keyof typeof COLUMN_NAMES]}
          </div>
        ))}
      </div>
    );
  } else {
    const types = ['%', '$'];
    const changeInterval = (e: MouseEvent<HTMLButtonElement>) => {
      const i = e.currentTarget.value;
      if (i && i !== interval) {
        const newColumns = [...columns];
        const tmpCol = parseColumn(newColumns[column]);
        tmpCol.interval = i;
        newColumns[column] = makeColumnString(tmpCol);

        dispatch(setListColumns(newColumns));
      }
    };
    const changeType = (e: MouseEvent<HTMLButtonElement>) => {
      const t = e.currentTarget.value;
      if (t && t !== type) {
        const newColumns = [...columns];
        const tmpCol = parseColumn(newColumns[column]);
        tmpCol.type = t;
        newColumns[column] = makeColumnString(tmpCol);

        dispatch(setListColumns(newColumns));
      }
    };

    return (
      <>
        <div className={css.Setting}>
          <div>Display type</div>
          <div>
            {types.map((t) => (
              <button key={t} value={t} onClick={changeType} className={type === t ? css.Active : ''}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className={css.Intervals}>
          {LIST_INTERVALS.map((i) => {
            return (
              <button key={i} value={i} className={i === interval ? css.Active : ''} onClick={changeInterval}>
                {getIntervalName(i)}
              </button>
            );
          })}
        </div>
      </>
    );
  }
}

type TFavouritesProps = {
  stock: string;
};

type THeaderProps = {
  column: number;
};
