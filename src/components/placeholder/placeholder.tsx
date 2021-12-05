import { CSSProperties, ReactElement } from 'react';
import css from './placeholder.module.css';

export function Placeholder({ className, style }: TProps): ReactElement {
  const classNames = [css.Placeholder];
  if (className) classNames.push(className);

  return <div className={classNames.join(' ')} style={style} />;
}

type TProps = {
  className?: string;
  style?: CSSProperties;
};
