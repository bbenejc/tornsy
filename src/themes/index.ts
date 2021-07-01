import light from "./light";
import dark from "./dark";

export function getTheme(theme: string): TTheme {
  if (theme === "light") return light;
  else return dark;
}

type TTheme = {
  dark: boolean;
  paper: string;
  grid: string;
  axis: string;
  crosshair: string;
  font: string;
  fontSec: string;
  red: string;
  green: string;
  volume: string;
  indicators: string[];
};
