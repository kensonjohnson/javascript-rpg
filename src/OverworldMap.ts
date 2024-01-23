import { GameObject } from "./GameObject";
import { Person } from "./Person";
import { withGridOffset } from "./utils";

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

  drawLowerImage(context: CanvasRenderingContext2D, cameraPerson: GameObject) {
    context.drawImage(
      this.lowerImage,
      withGridOffset(10.5) - cameraPerson.x,
      withGridOffset(6) - cameraPerson.y
    );
  }
  drawUpperImage(context: CanvasRenderingContext2D, cameraPerson: GameObject) {
    context.drawImage(
      this.upperImage,
      withGridOffset(10.5) - cameraPerson.x,
      withGridOffset(6) - cameraPerson.y
    );
  }
}

window.OverworldMaps = {
  DemoRoom: {
    lowerSrc: import.meta.env.BASE_URL + "images/maps/DemoLower.png",
    upperSrc: import.meta.env.BASE_URL + "images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        x: withGridOffset(5),
        y: withGridOffset(6),
        isPlayerControlled: true,
      }),
      npc1: new Person({
        x: withGridOffset(7),
        y: withGridOffset(9),
        src: import.meta.env.BASE_URL + "images/characters/people/npc1.png",
      }),
    },
  },
  Kitchen: {
    lowerSrc: import.meta.env.BASE_URL + "images/maps/KitchenLower.png",
    upperSrc: import.meta.env.BASE_URL + "images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        x: withGridOffset(3),
        y: withGridOffset(5),
      }),
      npcA: new Person({
        x: withGridOffset(9),
        y: withGridOffset(6),
        src: import.meta.env.BASE_URL + "images/characters/people/npc2.png",
      }),
      npcB: new Person({
        x: withGridOffset(10),
        y: withGridOffset(8),
        src: import.meta.env.BASE_URL + "images/characters/people/npc3.png",
      }),
    },
  },
};
