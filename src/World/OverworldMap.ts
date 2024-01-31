import { Overworld } from "./Overworld";
import { Person } from "./Person";
import { asGridCoord, nextPosition, withGridOffset } from "../utils";
import { OverworldEvent, type OverworldEventType } from "./OverworldEvent";
import type { GameObject } from "./GameObject";

declare global {
  interface Window {
    OverworldMaps: {
      [key: string]: {
        lowerSrc: string;
        upperSrc: string;
        gameObjects: Record<string, Person>;
        walls?: { [key: string]: boolean };
        cutsceneSpaces?: { [key: string]: { events: OverworldEventType[] }[] };
      };
    };
  }
}

export type OverworldMapConfig = {
  gameObjects: { [key: string]: Person };
  lowerSrc: string;
  upperSrc: string;
  walls?: { [key: string]: boolean };
  cutsceneSpaces?: { [key: string]: { events: OverworldEventType[] }[] };
};

export class OverworldMap {
  overworld: Overworld | null;
  gameObjects: { [key: string]: Person };
  walls: { [key: string]: boolean };
  lowerImage: HTMLImageElement;
  upperImage: HTMLImageElement;
  isCutscenePlaying: boolean;
  cutsceneSpaces: { [key: string]: { events: OverworldEventType[] }[] };
  isPaused: boolean;

  constructor(config: OverworldMapConfig) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.walls = config.walls ?? {};
    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;
    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;
    this.isCutscenePlaying = false;
    this.cutsceneSpaces = config.cutsceneSpaces ?? {};
    this.isPaused = false;
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

  async startCutscene(events: OverworldEventType[]) {
    this.isCutscenePlaying = true;

    // Start a loop of async events
    // and await each one
    for (const event of events) {
      const eventHandler = new OverworldEvent({ map: this, event });
      const result = await eventHandler.init();
      if (result === "LOST_BATTLE") {
        break;
      }
    }

    this.isCutscenePlaying = false;

    // Reset all game objects idle animations
    Object.values(this.gameObjects).forEach((gameObject) =>
      gameObject.doBehaviorEvent(this)
    );
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const coords = nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find((gameObject) => {
      return gameObject.x === coords.x && gameObject.y === coords.y;
    });

    if (!this.isCutscenePlaying && match && match.talking.length) {
      const relevantScenario = match.talking.find((scenario) => {
        return (scenario.required ?? []).every((storyFlag) => {
          return window.PlayerState.storyFlags[storyFlag];
        });
      });
      relevantScenario && this.startCutscene(relevantScenario.events);
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene(match[0].events);
    }
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
        behaviorLoop: [
          { type: "stand", direction: "up", time: 800 },
          { type: "stand", direction: "left", time: 1200 },
          { type: "stand", direction: "up", time: 350 },
          { type: "stand", direction: "right", time: 1000 },
        ],
        talking: [
          {
            required: ["DEFEATED_BETH"],
            events: [
              {
                type: "textMessage",
                text: "You can press ESC to toggle the pause menu.",
                faceHero: "npc1",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "Good job, now we can fight!",
                faceHero: "npc1",
              },
              { type: "battle", enemyId: "beth" },
              { type: "addStoryFlag", flag: "DEFEATED_BETH" },
              { type: "textMessage", text: "You crushed me!" },
              {
                type: "textMessage",
                text: "People might have something different to say after you beat them...",
              },
            ],
          },
        ],
      }),
      npc2: new Person({
        x: withGridOffset(8),
        y: withGridOffset(5),
        src: import.meta.env.BASE_URL + "images/characters/people/erio.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Bahahaha!", faceHero: "npc2" },
              { type: "addStoryFlag", flag: "TALKED_TO_ERIO" },
            ],
          },
        ],
      }),
    },
    walls: {
      [asGridCoord(0, 4)]: true, // west wall
      [asGridCoord(0, 5)]: true, // west wall
      [asGridCoord(0, 6)]: true, // west wall
      [asGridCoord(0, 7)]: true, // west wall
      [asGridCoord(0, 8)]: true, // west wall
      [asGridCoord(0, 9)]: true, // west wall
      [asGridCoord(1, 3)]: true, // north wall
      [asGridCoord(2, 3)]: true, // north wall
      [asGridCoord(3, 3)]: true, // north wall
      [asGridCoord(4, 3)]: true, // north wall
      [asGridCoord(5, 3)]: true, // north wall
      [asGridCoord(6, 3)]: true, // north wall
      [asGridCoord(7, 3)]: true, // north wall
      [asGridCoord(8, 3)]: true, // north wall
      [asGridCoord(9, 3)]: true, // north wall
      [asGridCoord(10, 3)]: true, // north wall
      [asGridCoord(11, 3)]: true, // north wall
      [asGridCoord(8, 4)]: true, // closet
      [asGridCoord(6, 4)]: true, // closet
      [asGridCoord(11, 4)]: true, // east wall
      [asGridCoord(11, 5)]: true, // east wall
      [asGridCoord(11, 6)]: true, // east wall
      [asGridCoord(11, 7)]: true, // east wall
      [asGridCoord(11, 8)]: true, // east wall
      [asGridCoord(11, 9)]: true, // east wall
      [asGridCoord(7, 6)]: true, // table
      [asGridCoord(8, 6)]: true, // table
      [asGridCoord(7, 7)]: true, // table
      [asGridCoord(8, 7)]: true, // table
      [asGridCoord(1, 10)]: true, // south wall
      [asGridCoord(2, 10)]: true, // south wall
      [asGridCoord(3, 10)]: true, // south wall
      [asGridCoord(4, 10)]: true, // south wall
      [asGridCoord(6, 10)]: true, // south wall
      [asGridCoord(7, 10)]: true, // south wall
      [asGridCoord(8, 10)]: true, // south wall
      [asGridCoord(9, 10)]: true, // south wall
      [asGridCoord(10, 10)]: true, // south wall
    },
    cutsceneSpaces: {
      [asGridCoord(7, 4)]: [
        {
          events: [
            { target: "npc2", type: "walk", direction: "left" },
            { target: "npc2", type: "stand", direction: "up", time: 25 },
            { type: "textMessage", text: "Hey!" },
            { type: "textMessage", text: "You're not allowed in there!" },
            { target: "npc2", type: "walk", direction: "right" },
            { target: "npc2", type: "stand", direction: "down", time: 1 },
            { target: "hero", type: "walk", direction: "down" },
          ],
        },
      ],
      [asGridCoord(5, 10)]: [
        {
          events: [{ type: "changeMap", map: "Kitchen" }],
        },
      ],
    },
  },
  Kitchen: {
    lowerSrc: import.meta.env.BASE_URL + "images/maps/KitchenLower.png",
    upperSrc: import.meta.env.BASE_URL + "images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: withGridOffset(5),
        y: withGridOffset(5),
      }),
      npc3: new Person({
        x: withGridOffset(10),
        y: withGridOffset(8),
        src: import.meta.env.BASE_URL + "images/characters/people/npc3.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "You made it!", faceHero: "npc3" },
            ],
          },
        ],
      }),
    },
    walls: {
      [asGridCoord(0, 4)]: true, // west wall
      [asGridCoord(0, 8)]: true, // west wall
      [asGridCoord(1, 3)]: true, // north wall
      [asGridCoord(2, 3)]: true, // north wall
      [asGridCoord(3, 3)]: true, // north wall
      [asGridCoord(4, 3)]: true, // north wall
      [asGridCoord(5, 3)]: true, // north wall
      [asGridCoord(6, 3)]: true, // north wall
      [asGridCoord(7, 3)]: true, // north wall
      [asGridCoord(8, 3)]: true, // north wall
      [asGridCoord(9, 3)]: true, // north wall
      [asGridCoord(10, 3)]: true, // north wall
      [asGridCoord(11, 4)]: true, // north wall
      [asGridCoord(12, 4)]: true, // north wall
      [asGridCoord(13, 5)]: true, // east wall
      [asGridCoord(13, 6)]: true, // east wall
      [asGridCoord(13, 7)]: true, // east wall
      [asGridCoord(13, 8)]: true, // east wall
      [asGridCoord(13, 9)]: true, // east wall
      [asGridCoord(3, 10)]: true, // south wall
      [asGridCoord(4, 10)]: true, // south wall
      [asGridCoord(6, 10)]: true, // south wall
      [asGridCoord(7, 10)]: true, // south wall
      [asGridCoord(8, 10)]: true, // south wall
      [asGridCoord(11, 10)]: true, // south wall
      [asGridCoord(12, 10)]: true, // south wall
      [asGridCoord(6, 7)]: true, // table
      [asGridCoord(7, 7)]: true, // table
      [asGridCoord(9, 9)]: true, // table
      [asGridCoord(10, 9)]: true, // table
      [asGridCoord(9, 7)]: true, // table
      [asGridCoord(10, 7)]: true, // table
      [asGridCoord(1, 5)]: true, // stove
      [asGridCoord(1, 6)]: true, // stove
      [asGridCoord(1, 7)]: true, // stove
      [asGridCoord(1, 9)]: true, // box
      [asGridCoord(2, 9)]: true, // box
    },
    cutsceneSpaces: {
      [asGridCoord(5, 10)]: [
        {
          events: [
            { type: "textMessage", text: "More to come later!" },
            { target: "hero", type: "walk", direction: "up" },
          ],
        },
      ],
    },
  },
};
