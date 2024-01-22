import { GameObject } from "./GameObject";

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
    image.src = "/images/maps/DemoLower.png";

    // Place some GameObjects
    const hero = new GameObject({
      x: 5,
      y: 6,
      src: "/images/characters/people/hero.png",
    });

    const npc1 = new GameObject({
      x: 7,
      y: 9,
      src: "/images/characters/people/npc1.png",
    });

    setTimeout(() => {
      hero.sprite.draw(this.context);
      npc1.sprite.draw(this.context);
    }, 100);
  }
}
