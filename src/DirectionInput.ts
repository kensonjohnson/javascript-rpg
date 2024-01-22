type ValidKey =
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "KeyW"
  | "KeyS"
  | "KeyA"
  | "KeyD";

export class DirectionInput {
  heldDirections: string[];
  map: { [key in ValidKey]: string };
  constructor() {
    this.heldDirections = [];
    this.map = {
      ArrowUp: "up",
      KeyW: "up",
      ArrowDown: "down",
      KeyS: "down",
      ArrowLeft: "left",
      KeyA: "left",
      ArrowRight: "right",
      KeyD: "right",
    };
  }

  get direction() {
    return this.heldDirections[0];
  }

  init() {
    document.addEventListener("keydown", (event) => {
      const direction = this.map[event.code as ValidKey];
      if (direction && !this.heldDirections.includes(direction)) {
        this.heldDirections.unshift(direction);
      }
    });

    document.addEventListener("keyup", (event) => {
      const direction = this.map[event.code as ValidKey];
      const index = this.heldDirections.indexOf(direction);
      if (index > -1) {
        this.heldDirections.splice(index, 1);
      }
    });
  }
}
