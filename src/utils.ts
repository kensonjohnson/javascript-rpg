export function withGridOffset(point: number) {
  return point * 16;
}

export function asGridCoord(x: number, y: number) {
  return `${withGridOffset(x)},${withGridOffset(y)}`;
}

export function nextPosition(
  currentX: number,
  currentY: number,
  direction: "up" | "down" | "left" | "right"
) {
  let x = currentX;
  let y = currentY;
  const size = 16;

  if (direction === "up") {
    y -= size;
  }
  if (direction === "down") {
    y += size;
  }
  if (direction === "left") {
    x -= size;
  }
  if (direction === "right") {
    x += size;
  }
  return { x, y };
}
