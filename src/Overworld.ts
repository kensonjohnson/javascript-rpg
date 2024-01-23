import { DirectionInput } from "./DirectionInput";
import { OverworldMap } from "./OverworldMap";
import type { GameObject } from "./GameObject";
import type { ValidDirections } from "./Person";

type OverworldConfig = {
  element: HTMLElement;
};

export class Overworld {
  element: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  map: OverworldMap;
  directionInput: DirectionInput;
  cameraPerson: GameObject;
  timestamp: number;
  constructor(config: OverworldConfig) {
    this.element = config.element;
    this.canvas = this.element.querySelector(
      ".game-canvas"
    ) as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.map = new OverworldMap(window.OverworldMaps.DemoRoom);
    this.cameraPerson = this.map.gameObjects.hero;
    this.timestamp = 0;
    this.directionInput = new DirectionInput();
  }

  gameLoop() {
    // Find the time since the last frame
    const now = Date.now();
    const delta = now - this.timestamp;

    // If the time since the last frame is too short, don't update
    if (delta < 1000 / 60) {
      requestAnimationFrame(() => this.gameLoop());
      return;
    }

    // Update the timestamp
    this.timestamp = now;

    // Clear the canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    Object.values(this.map.gameObjects ?? {}).forEach((gameObject) => {
      gameObject.update({
        arrow: this.directionInput!.direction as ValidDirections,
        map: this.map,
      });
    });

    // Draw lower image
    this.map.drawLowerImage(this.context, this.cameraPerson);

    // Draw game objects
    Object.values(this.map.gameObjects ?? {})
      .sort((a, b) => {
        return a.y - b.y;
      })
      .forEach((gameObject) => {
        gameObject.sprite.draw(this.context, this.cameraPerson);
      });

    // Draw upper image
    this.map.drawUpperImage(this.context, this.cameraPerson);

    requestAnimationFrame(() => this.gameLoop());
  }

  init() {
    // Mount the game objects
    this.map.mountObjects();

    // Start the direction controls
    this.directionInput.init();

    // Start game loop
    this.gameLoop();

    this.map.startCutscene([
      { target: "hero", type: "walk", direction: "down" },
      { target: "hero", type: "walk", direction: "down" },
      { target: "npc1", type: "walk", direction: "left" },
      { target: "npc1", type: "walk", direction: "left" },
      { target: "npc1", type: "stand", direction: "up", time: 1500 },
      { target: "npc1", type: "walk", direction: "right" },
      { target: "npc1", type: "walk", direction: "right" },
    ]);
  }
}
