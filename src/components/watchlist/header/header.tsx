import { ReactElement, MouseEvent, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectListColumns, selectListOrder, setListSorting } from 'app/store';
import css from './header.module.css';
import { parseColumn } from 'tools';
import { getIntervalName } from 'tools/intervals';
import { COLUMN_NAMES } from 'config';

function Header({ className }: TProps): ReactElement {
  const dispatch = useDispatch();
  const headers = ['name', 'price', ...useSelector(selectListColumns)];
  const [sortColumn] = useSelector(selectListOrder).split('-');

  const changeOrder = (order: string) => (e: MouseEvent) => {
    dispatch(setListSorting(order));
    e.stopPropagation();
  };

  return (
    <div className={[className, css.Header].join(' ')}>
      {headers.map((h) => {
        const parsedHeader = parseColumn(h);
        return (
          <div key={h}>
            <span onClick={changeOrder(h)} className={h === sortColumn ? css.Sorted : ''}>
              {parsedHeader.interval === '' ? COLUMN_NAMES[parsedHeader.field] : getIntervalName(parsedHeader.interval)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export const WatchlistHeader = memo(Header);

type TProps = {
  className: string;
};
