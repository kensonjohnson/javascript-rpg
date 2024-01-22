import { GameObject } from "./GameObject";
import { Person } from "./Person";
import { asGridPoint } from "./utils";

declare global {
  interface Window {
    OverworldMaps: {
      [key: string]: {
        lowerSrc: string;
        upperSrc: string;
        gameObjects: {
          [key: string]: GameObject | Person;
        };
      };
    };
  }
}

type OverworldMapConfig = {
  gameObjects: { [key: string]: GameObject | Person };
  lowerSrc: string;
  upperSrc: string;
};

export class OverworldMap {
  gameObjects: { [key: string]: GameObject | Person };
  lowerImage: HTMLImageElement;
  upperImage: HTMLImageElement;
  constructor(config: OverworldMapConfig) {
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
      hero: new Person({
        x: asGridPoint(5),
        y: asGridPoint(6),
        isPlayerControlled: true,
      }),
      npc1: new Person({
        x: asGridPoint(7),
        y: asGridPoint(9),
        src: import.meta.env.BASE_URL + "images/characters/people/npc1.png",
      }),
    },
  },
  Kitchen: {
    lowerSrc: import.meta.env.BASE_URL + "images/maps/KitchenLower.png",
    upperSrc: import.meta.env.BASE_URL + "images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        x: asGridPoint(3),
        y: asGridPoint(5),
      }),
      npcA: new Person({
        x: asGridPoint(9),
        y: asGridPoint(6),
        src: import.meta.env.BASE_URL + "images/characters/people/npc2.png",
      }),
      npcB: new Person({
        x: asGridPoint(10),
        y: asGridPoint(8),
        src: import.meta.env.BASE_URL + "images/characters/people/npc3.png",
      }),
    },
  },
};
