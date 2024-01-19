type OverworldConfig = {
  element: HTMLElement;
};

export class Overworld {
  element: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  constructor(config: OverworldConfig) {
    this.element = config.element;
    this.canvas = this.element.querySelector(
      ".game-canvas"
    ) as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  init() {
    const image = new Image();
    image.onload = () => {
      this.context.drawImage(image, 0, 0);
    };
    image.src = "images/maps/DemoLower.png";
  }
}
