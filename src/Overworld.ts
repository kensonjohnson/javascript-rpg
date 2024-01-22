import { OverworldMap } from "./OverworldMap";

type OverworldConfig = {
  element: HTMLElement;
};

export class Overworld {
  element: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  map: OverworldMap | null;
  constructor(config: OverworldConfig) {
    this.element = config.element;
    this.canvas = this.element.querySelector(
      ".game-canvas"
    ) as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.map = null;
  }

  gameLoop() {
    // Clear the canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw lower image
    this.map?.drawLowerImage(this.context);

    // Draw game objects
    Object.values(this.map?.gameObjects ?? {}).forEach((gameObject) => {
      gameObject.sprite.draw(this.context);
    });

    // Draw upper image
    this.map?.drawUpperImage(this.context);

    requestAnimationFrame(() => this.gameLoop());
  }

  init() {
    // Set up the map
    this.map = new OverworldMap(window.OverworldMaps.Kitchen);

    // Start game loop
    this.gameLoop();
  }
}
