//https://github.com/testing-library/react-testing-library/issues/268

type FakePointerEventInit = {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
  altKey?: boolean;
  button?: 0 | 1 | 2 | 3 | 4;
  buttons?: number;
  clientX?: number;
  clientY?: number;
  ctrlKey?: boolean;
  metaKey?: boolean;
  movementX?: number;
  movementY?: number;
  offsetX?: number;
  offsetY?: number;
  pageX?: number;
  pageY?: number;
  pointerId?: number;
  screenX?: number;
  screenY?: number;
  shiftKey?: boolean;
  x?: number;
  y?: number;
};

export class FakePointerEvent extends MouseEvent {
  movementX: number;
  movementY: number;
  pointerId: number;
  offsetX: number;
  offsetY: number;
  pageX: number;
  pageY: number;
  x: number;
  y: number;

  constructor(type: string, values: FakePointerEventInit) {
    const {
      pageX,
      pageY,
      offsetX,
      offsetY,
      movementX,
      movementY,
      pointerId,
      x,
      y,
      ...pointerValues
    } = values;
    super(type, pointerValues);

    this.offsetX = offsetX || 0;
    this.offsetY = offsetY || 0;
    this.movementX = movementX || 0;
    this.movementY = movementY || 0;
    this.pageX = pageX || 0;
    this.pageY = pageY || 0;
    this.pointerId = pointerId || 0;
    this.x = x || 0;
    this.y = y || 0;
  }
}

export class PointerMoveEvent extends FakePointerEvent {
  constructor(values: FakePointerEventInit) {
    super('pointermove', {
      bubbles: true,
      cancelable: true,
      ...values,
    });
  }
}

export class PointerDownEvent extends FakePointerEvent {
  constructor(values: FakePointerEventInit = {}) {
    super('pointerdown', {
      bubbles: true,
      cancelable: true,
      ...values,
    });
  }
}

export class PointerUpEvent extends FakePointerEvent {
  constructor(values: FakePointerEventInit = {}) {
    super('pointerup', {
      bubbles: true,
      cancelable: true,
      ...values,
    });
  }
}
