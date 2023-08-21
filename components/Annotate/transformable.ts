import type { Constraint } from './transform';
import { Transform, constrain } from './transform';

export type TransformableState = {
  x?: Constraint;
  y?: Constraint;
  scale?: Constraint;
  transform: Transform;
  onTransform: (state: TransformableState) => void;
  onResize: (width: number, height: number) => void;
};

export function transformable(
  node: HTMLElement,
  options: Partial<TransformableState> = {},
): {
  update?: (parameters: any) => void;
  destroy?: () => void;
} {
  let state: TransformableState = {
    transform: new Transform(),
    onTransform: () => {},
    onResize: () => {},

    ...options,
  };

  function zoom(s: number, x: number, y: number) {
    state.transform.scaleAround(s, [x, y], state.x, state.y, state.scale);

    apply();

    return state;
  }

  function pan(x: number, y: number) {
    state.transform.translate([x, y], state.x, state.y);

    apply();

    return state;
  }

  function twoPoint(
    [fromAX = 0, fromAY = 0] = [],
    [toAX = 0, toAY = 0] = [],
    [fromBX = 0, fromBY = 0] = [],
    [toBX = 0, toBY = 0] = [],
  ) {
    [fromAX, fromAY] = state.transform.dividePoint([fromAX, fromAY]);
    [toAX, toAY] = state.transform.dividePoint([toAX, toAY]);
    [fromBX, fromBY] = state.transform.dividePoint([fromBX, fromBY]);
    [toBX, toBY] = state.transform.dividePoint([toBX, toBY]);

    const lengthFromAB = Math.hypot(fromBX - fromAX, fromBY - fromAY);
    const lengthToAB = Math.hypot(toBX - toAX, toBY - toAY);
    let scale = constrain((state.transform.scale * lengthToAB) / lengthFromAB, state.scale) / state.transform.scale;

    const move: [number, number] = [
      (toAX + toBX) / 2 - (scale * (fromAX + fromBX)) / 2,
      (toAY + toBY) / 2 - (scale * (fromAY + fromBY)) / 2,
    ];

    state.transform.multiply(new Transform(scale, move), state.x, state.y, state.scale);

    apply();

    return state;
  }

  function apply() {
    state.onTransform(state);
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();

    let deltaX: number;
    let deltaY: number;

    // if (e.shiftKey) {
    // 	deltaX = e.deltaY;
    // 	deltaY = e.deltaX;
    // } else {
    deltaX = e.deltaX;
    deltaY = e.deltaY;
    // }

    if (e.deltaMode !== WheelEvent.DOM_DELTA_PIXEL) {
      deltaX = Math.sign(deltaX) * 100;
      deltaY = Math.sign(deltaY) * 100;
    }

    const mouse = [e.clientX, e.clientY];

    if (e.ctrlKey) {
      zoom(Math.exp(-e.deltaY / 100), mouse[0], mouse[1]);
    } else {
      pan(-e.deltaX, -e.deltaY);
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (e.buttons === 4) {
      pan(e.movementX, e.movementY);
    }
  }

  function findTouch(touches: TouchList, identifier: number) {
    for (var i = 0; i < touches.length; i++) {
      const id = touches[i].identifier;

      if (id === identifier) {
        return touches[i];
      }
    }

    return null;
  }

  let currentTouches: TouchList;

  function handleTouchStart(e: TouchEvent) {
    currentTouches = e.touches;
  }

  function handleTouchMove(e: TouchEvent) {
    e.preventDefault();

    if (e.touches.length === 2 && currentTouches.length >= 2 && currentTouches) {
      const touchA = e.touches[0];
      const touchB = e.touches[1];
      const lastTouchA = findTouch(currentTouches, touchA.identifier) ?? touchA;
      const lastTouchB = findTouch(currentTouches, touchB.identifier) ?? touchB;

      const posA: [number, number] = [touchA.clientX, touchA.clientY];
      const posB: [number, number] = [touchB.clientX, touchB.clientY];
      const lastPosA: [number, number] = [lastTouchA.clientX, lastTouchA.clientY];
      const lastPosB: [number, number] = [lastTouchB.clientX, lastTouchB.clientY];

      twoPoint(lastPosA, posA, lastPosB, posB);
    }

    currentTouches = e.touches;
  }

  let lastWidth = window.innerWidth;
  let lastHeight = window.innerHeight;

  function handleResize() {
    twoPoint([0, 0], [0, 0], [lastWidth, lastHeight], [window.innerWidth, window.innerHeight]);

    lastWidth = window.innerWidth;
    lastHeight = window.innerHeight;

    state.onResize(window.innerWidth, window.innerHeight);
  }

  node.addEventListener('wheel', handleWheel);
  node.addEventListener('mousemove', handleMouseMove);
  node.addEventListener('touchstart', handleTouchStart);
  node.addEventListener('touchmove', handleTouchMove);

  window.addEventListener('resize', handleResize);

  requestAnimationFrame(apply);

  return {
    destroy: () => {
      node.removeEventListener('wheel', handleWheel);
      node.removeEventListener('mousemove', handleMouseMove);
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchmove', handleTouchMove);

      window.removeEventListener('resize', handleResize);
    },
    update: (options: TransformableState) => {
      state = Object.assign(state, options);
      apply();
    },
  };
}
