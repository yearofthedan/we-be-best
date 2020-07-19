export const patchArrayElement = <T>(
  array: T[],
  update: Partial<T>,
  predicate: (e: T) => boolean
): T[] => {
  const current = array.find(predicate);
  const entryIndex = array.findIndex(predicate);
  if (!current || entryIndex === -1) {
    throw new Error('element not found in array');
  }
  return [
    ...array.slice(0, entryIndex),
    { ...current, ...update },
    ...array.slice(entryIndex + 1),
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
  entry: T,
  predicate: (e: T) => boolean
): T[] => {
  const index = array.findIndex(predicate);

  if (index === -1) {
    return [...array, entry];
  }

  return [...array.slice(0, index), entry, ...array.slice(index + 1)];
};
