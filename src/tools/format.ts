// Detect user's number formatting locale (decimal and thousands separator)
const decimalSeparators = [",", "."];
try {
  const decimal = (1.1).toLocaleString(navigator.languages[0]).substring(1, 2);
  if (decimal === ",") {
    decimalSeparators[0] = ".";
    decimalSeparators[1] = ",";
  }
} catch {
  // do nothing
}

const signs: [number, string][] = [
  // [Math.pow(1000, 6), 'qi'],
  // [Math.pow(1000, 5), 'qa'],
  [Math.pow(1000, 4), "T"],
  [Math.pow(1000, 3), "B"],
  [Math.pow(1000, 2), "M"],
  [Math.pow(1000, 1), "K"],
];

export function formatNumber(
  val: number | undefined,
  short = false,
  dec = 2
): string {
  if (typeof val === "undefined") return "-";

  let numVal = val;
  let suffix = "";
  if (short) {
    for (let s = 0; s < signs.length; s += 1) {
      if (val >= signs[s][0]) {
        numVal /= signs[s][0];
        suffix = signs[s][1];
        break;
      }
    }
  }

  const digits = numVal.toFixed(dec).split(".");

  return (
    separateThousands(digits[0]) +
    (dec > 0 ? decimalSeparators[1] + digits[1] : "") +
    suffix
  );
}

function separateThousands(num: string) {
  let res = num;
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(res))
    res = res.replace(pattern, "$1" + decimalSeparators[0] + "$2");

  return res;
}
