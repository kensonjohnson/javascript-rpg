import { Person } from "./Person";
import { asGridCoord, nextPosition, withGridOffset } from "./utils";
import type { GameObject } from "./GameObject";

declare global {
  interface Window {
    OverworldMaps: {
      [key: string]: {
        lowerSrc: string;
        upperSrc: string;
        gameObjects: {
          [key: string]: GameObject | Person;
        };
        walls?: { [key: string]: boolean };
      };
    };
  }
}

type OverworldMapConfig = {
  gameObjects: { [key: string]: GameObject | Person };
  lowerSrc: string;
  upperSrc: string;
  walls?: { [key: string]: boolean };
};

export class OverworldMap {
  gameObjects: { [key: string]: GameObject | Person };
  walls: { [key: string]: boolean };
  lowerImage: HTMLImageElement;
  upperImage: HTMLImageElement;
  constructor(config: OverworldMapConfig) {
    this.gameObjects = config.gameObjects;
    this.walls = config.walls ?? {};
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

  isSpaceTaken(
    currentX: number,
    currentY: number,
    direction: "up" | "down" | "left" | "right"
  ) {
    const { x, y } = nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach((key) => {
      const gameObject = this.gameObjects[key];
      gameObject.id = key;

      // TODO: determine if this object should actually mount
      gameObject.mount(this);
    });
  }

  addWall(x: number, y: number) {
    this.walls[`${x},${y}`] = true;
  }

  removeWall(x: number, y: number) {
    delete this.walls[`${x},${y}`];
  }

  moveWall(
    currentX: number,
    currentY: number,
    direction: "up" | "down" | "left" | "right"
  ) {
    this.removeWall(currentX, currentY);
    const { x, y } = nextPosition(currentX, currentY, direction);
    this.addWall(x, y);
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
    walls: {
      [asGridCoord(7, 6)]: true,
      [asGridCoord(8, 6)]: true,
      [asGridCoord(7, 7)]: true,
      [asGridCoord(8, 7)]: true,
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
