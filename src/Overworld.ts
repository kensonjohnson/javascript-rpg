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
    // Draw level
    const image = new Image();
    image.onload = () => {
      this.context.drawImage(image, 0, 0);
    };
    image.src = "images/maps/DemoLower.png";

    // Draw player
    const x = 5;
    const y = 6;

    const shadow = new Image();
    shadow.onload = () => {
      this.context.drawImage(
        shadow, // image
        0, // left cut
        0, // top cut
        32, // width cut
        32, // height cut
        x * 16 - 8, // x position with tile offset
        y * 16 - 18, // y position with tile offset
        32, // width
        32 // height
      );
    };
    shadow.src = "images/characters/shadow.png";

    const hero = new Image();
    hero.onload = () => {
      this.context.drawImage(
        hero, // image
        0, // left cut
        0, // top cut
        32, // width cut
        32, // height cut
        x * 16 - 8, // x position with tile offset
        y * 16 - 18, // y position with tile offset
        32, // width
        32 // height
      );
    };
    hero.src = "images/characters/people/hero.png";
  }
}
