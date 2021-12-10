import { CSSProperties, ReactElement } from 'react';
import css from './placeholder.module.css';

export function Placeholder({ className, style = {}, width }: TProps): ReactElement {
  const classNames = [css.Placeholder];
  if (className) classNames.push(className);
  if (width) style.width = width + 'em';

  return <div className={classNames.join(' ')} style={style} />;
}

type TProps = {
  className?: string;
  style?: CSSProperties;
  width?: number;
};
