export const timeout = (ms: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

export const get = (path: string[], object: any) => {
  return path.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), object);
};
