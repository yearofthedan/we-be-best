export const supportsTouchEvents = (): boolean => {
  return 'ontouchstart' in window;
};

export const MOUSE_BUTTONS: { [key: string]: number } = {
  primary: 0,
  secondary: 1,
};
