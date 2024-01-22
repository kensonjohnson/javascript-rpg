import { GameObject } from "./GameObject";

declare global {
  interface Window {
    OverworldMaps: {
      [key: string]: {
        lowerSrc: string;
        upperSrc: string;
        gameObjects: {
          [key: string]: {
            x: number;
            y: number;
            src?: string;
          };
        };
      };
    };
  }
}

export class OverworldMap {
  gameObjects: GameObject[];
  lowerImage: HTMLImageElement;
  upperImage: HTMLImageElement;
  constructor(config: any) {
    this.gameObjects = config.gameObjects;
    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;
    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;
  }

  drawLowerImage(context: CanvasRenderingContext2D) {
    context.drawImage(this.lowerImage, 0, 0);
  }
  drawUpperImage(context: CanvasRenderingContext2D) {
    context.drawImage(this.upperImage, 0, 0);
  }
}

window.OverworldMaps = {
  DemoRoom: {
    lowerSrc: import.meta.env.BASE_URL + "images/maps/DemoLower.png",
    upperSrc: import.meta.env.BASE_URL + "images/maps/DemoUpper.png",
    gameObjects: {
      hero: new GameObject({
        x: 5,
        y: 6,
      }),
      npc1: new GameObject({
        x: 7,
        y: 9,
        src: import.meta.env.BASE_URL + "images/characters/people/npc1.png",
      }),
    },
  },
  Kitchen: {
    lowerSrc: import.meta.env.BASE_URL + "images/maps/KitchenLower.png",
    upperSrc: import.meta.env.BASE_URL + "images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new GameObject({
        x: 3,
        y: 5,
      }),
      npcA: new GameObject({
        x: 9,
        y: 6,
        src: import.meta.env.BASE_URL + "images/characters/people/npc2.png",
      }),
      npcB: new GameObject({
        x: 10,
        y: 8,
        src: import.meta.env.BASE_URL + "images/characters/people/npc3.png",
      }),
    },
  },
};
