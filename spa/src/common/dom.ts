export const PRIMARY_MOUSE_BUTTON_ID = 0;
export const SECONDARY_MOUSE_BUTTON_ID = 1;
export const supportsTouchEvents = (): boolean => {
  return 'ontouchstart' in window;
};
