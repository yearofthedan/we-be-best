//https://github.com/testing-library/react-testing-library/issues/268

type FakeMouseEventInit = {
  bubbles?: boolean,
  cancelable?: boolean,
  composed?: boolean,
  altKey?: boolean,
  button?: 0 | 1 | 2 | 3 | 4,
  buttons?: number,
  clientX?: number,
  clientY?: number,
  ctrlKey?: boolean,
  metaKey?: boolean,
  movementX?: number,
  movementY?: number,
  offsetX?: number,
  offsetY?: number,
  pageX?: number,
  pageY?: number,
  screenX?: number,
  screenY?: number,
  shiftKey?: boolean,
  x?: number,
  y?: number,
};

export class FakeMouseEvent extends MouseEvent {
  movementX: number;
  movementY: number;
  offsetX: number;
  offsetY: number;
  pageX: number;
  pageY: number;
  x: number;
  y: number;

  constructor(type: string, values: FakeMouseEventInit) {
    const {
      pageX,
      pageY,
      offsetX,
      offsetY,
      movementX,
      movementY,
      x,
      y,
      ...mouseValues
    } = values;
    super(type, mouseValues);

    this.offsetX = offsetX || 0;
    this.offsetY = offsetY || 0;
    this.movementX = movementX || 0;
    this.movementY = movementY || 0;
    this.pageX = pageX || 0;
    this.pageY = pageY || 0;
    this.x = x || 0;
    this.y = y || 0;
  }
}

export class MouseMoveEvent extends FakeMouseEvent {
  constructor(values: FakeMouseEventInit) {
    super('mousemove', {
      bubbles: true,
      cancelable: true,
      ...values,
    });
  }
}

