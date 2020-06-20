export const updateElementFieldsInArray = <T>(
  array: T[],
  update: Partial<T>,
  predicate: (e: T) => boolean
): T[] => {
  const current = array.find(predicate);
  const itemIndex = array.findIndex(predicate);
  if (!current || itemIndex === -1) {
    throw new Error('element should be in array');
  }
  return [
    ...array.slice(0, itemIndex),
    { ...current, ...update },
    ...array.slice(itemIndex + 1),
  ];
};
