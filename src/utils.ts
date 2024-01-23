export function withGridOffset(point: number) {
  return point * 16;
}

export function asGridCoord(x: number, y: number) {
  return `${withGridOffset(x)},${withGridOffset(y)}`;
}
