export function findDataIndex(data: any[], time: number): number {
  let index = -1;
  let min = 0;
  let max = data.length - 1;

  while (max >= min) {
    const tmp = Math.floor((max + min) / 2);
    const tmpTime = data[tmp][0];
    if (tmpTime === time) {
      index = tmp;
      break;
    } else if (time > tmpTime) min = tmp + 1;
    else max = tmp - 1;
  }

  return index;
}

export function sumArray(data: number[]): number {
  return data.reduce(function (pv, cv) {
    return pv + cv;
  }, 0);
}

export const EMPTY_ARRAY = [];
