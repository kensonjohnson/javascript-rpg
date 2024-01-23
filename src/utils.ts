import { gridSize } from "./config";

export function withGridOffset(point: number) {
  return point * gridSize;
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

  if (direction === "up") {
    y -= gridSize;
  }
  if (direction === "down") {
    y += gridSize;
  }
  if (direction === "left") {
    x -= gridSize;
  }
  if (direction === "right") {
    x += gridSize;
  }
  return { x, y };
}

export function emitEvent(name: string, detail: { [key: string]: any }) {
  const event = new CustomEvent(name, { detail });
  document.dispatchEvent(event);
}
