export const reduce = (arr: any[], acc, initial?) => {
  let res;
  initial ? (res = initial) : (res = null);
  arr.forEach((item, idx) => (res = acc(res, item, idx)));
  return res;
};

export const stringArrAcc = (prev, curr, idx) => {
  if (idx === 0 && !prev) {
    return curr;
  } else {
    return `${prev}, ${curr}`;
  }
};
