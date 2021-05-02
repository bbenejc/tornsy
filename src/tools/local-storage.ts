const THEME = "theme";
const ORDER = "list-order";

export function getTheme(): string | null {
  return localStorage.getItem(THEME);
}

export function setTheme(theme: string): void {
  localStorage.setItem(THEME, theme);
}

export function getListOrder(): string | null {
  return localStorage.getItem(ORDER);
}

export function setListOrder(order: string): void {
  localStorage.setItem(ORDER, order);
}
