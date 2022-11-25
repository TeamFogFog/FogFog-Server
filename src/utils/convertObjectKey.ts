export const convertObjectKey = (o: Object, value: unknown) => {
  let convertedKey;

  Object.keys(o).forEach((key) => {
    if (o[key] === value) return (convertedKey = Number(key));
  });

  return convertedKey;
};
