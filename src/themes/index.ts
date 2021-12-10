import light from './light';
import dark from './dark';

export function getTheme(theme: string): TTheme {
  if (theme === 'light') return light;
  else return dark;
}
