const signs: [number, string][] = [
  // [Math.pow(1000, 6), 'qi'],
  // [Math.pow(1000, 5), 'qa'],
  [Math.pow(1000, 4), "T"],
  [Math.pow(1000, 3), "B"],
  [Math.pow(1000, 2), "M"],
  [Math.pow(1000, 1), "K"],
];

export function formatNumber(val: number | undefined): string {
  if (typeof val === "undefined") return "-";

  let numVal = val;
  let suffix = "";
  for (let s = 0; s < signs.length; s += 1) {
    if (val >= signs[s][0]) {
      numVal /= signs[s][0];
      suffix = signs[s][1];
      break;
    }
  }

  return numVal.toFixed(2) + suffix;
}
