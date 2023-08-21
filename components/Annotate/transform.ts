type Point = [number, number];

export type Constraint = {
  min?: number;
  max?: number;
};

export function constrain(value: number, constraint: Constraint): number {
  if (typeof constraint !== 'object') return value;
  constraint = Object.assign({ min: -Infinity, max: Infinity }, constraint);
  return Math.min(Math.max(constraint.min, value), constraint.max);
}

export class Transform {
  constructor(public scale = 1, public translation: Point = [0, 0]) {}

  multiplyPoint([x, y]: Point): Point {
    return [x * this.scale + this.translation[0], y * this.scale + this.translation[1]];
  }

  dividePoint([x, y]: Point): Point {
    return [(x - this.translation[0]) / this.scale, (y - this.translation[1]) / this.scale];
  }

  multiply(
    { translation, scale }: Transform,
    xConstraint: Constraint = {},
    yConstraint: Constraint = {},
    scaleConstraint: Constraint = {},
  ) {
    this.scale = constrain(this.scale * scale, scaleConstraint);

    this.translation[0] += constrain(this.scale * translation[0], xConstraint);
    this.translation[1] += constrain(this.scale * translation[1], yConstraint);
  }

  translate([x, y]: Point = [0, 0], xConstraint: Constraint = {}, yConstraint: Constraint = {}) {
    this.translation[0] = constrain(this.translation[0] + x, xConstraint);
    this.translation[1] = constrain(this.translation[1] + y, yConstraint);
  }

  scaleAround(
    scale = 1,
    [x = 0, y = 0] = [],
    xConstraint: Constraint = {},
    yConstraint: Constraint = {},
    scaleConstraint: Constraint = {},
  ) {
    scale = constrain(this.scale * scale, scaleConstraint) / this.scale;
    this.translation[0] = constrain((this.translation[0] - x) * scale + x, xConstraint);
    this.translation[1] = constrain((this.translation[1] - y) * scale + y, yConstraint);
    this.scale *= scale;
  }

  clone() {
    return new Transform(this.scale, this.translation.slice() as Point);
  }
}
