export const patchArrayElement = <T>(
  array: T[],
  update: Partial<T>,
  predicate: (e: T) => boolean
): T[] => {
  const current = array.find(predicate);
  const itemIndex = array.findIndex(predicate);
  if (!current || itemIndex === -1) {
    throw new Error('element not found in array');
  }
  return [
    ...array.slice(0, itemIndex),
    { ...current, ...update },
    ...array.slice(itemIndex + 1),
  ];
};

export const removeArrayElement = <T>(
  array: T[],
  predicate: (e: T) => boolean
): T[] => {
  const index = array.findIndex(predicate);

  if (index === -1) {
    throw new Error('element not found in array');
  }

  return [...array.slice(0, index), ...array.slice(index + 1)];
};

export const upsertArrayElement = <T>(
  array: T[],
  item: T,
  predicate: (e: T) => boolean
): T[] => {
  const index = array.findIndex(predicate);

  if (index === -1) {
    return [...array, item];
  }

  return [...array.slice(0, index), item, ...array.slice(index + 1)];
};
