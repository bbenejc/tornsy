import type { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from 'app/store';
import { getTheme } from 'themes';
import css from './logo.module.css';

export function Logo(): ReactElement {
  const theme = getTheme(useSelector(selectTheme));

  return <img className={css.logo} src={'/' + theme.logo} alt="Tornsy" />;
}
