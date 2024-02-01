import { Overworld } from "./Overworld";
import { Person } from "./Person";
import { asGridCoord, nextPosition, withGridOffset } from "../utils";
import { OverworldEvent, type OverworldEventType } from "./OverworldEvent";
import { GameObject } from "./GameObject";
import { PizzaStone } from "./PizzaStone";

declare global {
  interface Window {
    OverworldMaps: {
      [key: string]: {
        id: string;
        lowerSrc: string;
        upperSrc: string;
        gameObjects: Record<string, Person | PizzaStone>;
        walls?: Record<string, boolean>;
        cutsceneSpaces?: { [key: string]: { events: OverworldEventType[] }[] };
      };
    };
  }
}

export type OverworldMapConfig = {
  id: string;
  gameObjects: Record<string, Person | PizzaStone>;
  lowerSrc: string;
  upperSrc: string;
  walls?: Record<string, boolean>;
  cutsceneSpaces?: { [key: string]: { events: OverworldEventType[] }[] };
};

export class OverworldMap {
  overworld: Overworld | null;
  gameObjects: Record<string, Person | PizzaStone>;
  walls: Record<string, boolean>;
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
    id: "DemoRoom",
    lowerSrc: import.meta.env.BASE_URL + "images/maps/DemoLower.png",
    upperSrc: import.meta.env.BASE_URL + "images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: withGridOffset(5),
        y: withGridOffset(6),
      }),
      npcA: new Person({
        x: withGridOffset(10),
        y: withGridOffset(8),
        src: import.meta.env.BASE_URL + "images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "left", time: 300 },
          { type: "stand", direction: "down", time: 700 },
          { type: "stand", direction: "right", time: 900 },
          { type: "stand", direction: "down", time: 400 },
        ],
        talking: [
          {
            required: ["TALKED_TO_ERIO"],
            events: [
              {
                type: "textMessage",
                text: "Isn't Erio the coolest?",
                faceHero: "npcA",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "I'm going to crush you!",
                faceHero: "npcA",
              },
              { type: "battle", enemyId: "beth" },
              { type: "addStoryFlag", flag: "DEFEATED_BETH" },
              {
                type: "textMessage",
                text: "You crushed me like weak pepper.",
                faceHero: "npcA",
              },
              { type: "textMessage", text: "Go away!" },
              //{ target: "npcB", type: "walk",  direction: "up" },
            ],
          },
        ],
      }),
      npcC: new Person({
        x: withGridOffset(4),
        y: withGridOffset(8),
        src: import.meta.env.BASE_URL + "images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "left", time: 500 },
          { type: "stand", direction: "down", time: 500 },
          { type: "stand", direction: "right", time: 500 },
          { type: "stand", direction: "up", time: 500 },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "up" },
        ],
      }),
      npcB: new Person({
        x: withGridOffset(8),
        y: withGridOffset(5),
        src: import.meta.env.BASE_URL + "images/characters/people/erio.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Bahaha!", faceHero: "npcB" },
              { type: "addStoryFlag", flag: "TALKED_TO_ERIO" },
            ],
          },
        ],
      }),
      pizzaStone: new PizzaStone({
        x: withGridOffset(2),
        y: withGridOffset(7),
        storyFlag: "USED_PIZZA_STONE",
        pizzas: ["v001", "f001"],
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
            { target: "npcB", type: "walk", direction: "left" },
            { target: "npcB", type: "stand", direction: "up", time: 500 },
            { type: "textMessage", text: "You can't be in there!" },
            { target: "npcB", type: "walk", direction: "right" },
            { target: "hero", type: "walk", direction: "down" },
            { target: "hero", type: "walk", direction: "left" },
          ],
        },
      ],
      [asGridCoord(5, 10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Kitchen",
              x: withGridOffset(6),
              y: withGridOffset(6),
              direction: "down",
            },
          ],
        },
      ],
    },
  },
  Kitchen: {
    id: "Kitchen",
    lowerSrc: import.meta.env.BASE_URL + "images/maps/KitchenLower.png",
    upperSrc: import.meta.env.BASE_URL + "images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: withGridOffset(10),
        y: withGridOffset(5),
      }),
      kitchenNpcA: new Person({
        x: withGridOffset(9),
        y: withGridOffset(5),
        direction: "up",
        src: import.meta.env.BASE_URL + "images/characters/people/npc8.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "** They don't want to talk to you **",
              },
            ],
          },
        ],
      }),
      kitchenNpcB: new Person({
        x: withGridOffset(3),
        y: withGridOffset(6),
        src: import.meta.env.BASE_URL + "images/characters/people/npc3.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "People take their jobs here very seriously.",
                faceHero: "kitchenNpcB",
              },
            ],
          },
        ],
        behaviorLoop: [
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "up", time: 500 },
          { type: "stand", direction: "left", time: 500 },
        ],
      }),
    },
    cutsceneSpaces: {
      [asGridCoord(5, 10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "DiningRoom",
              x: withGridOffset(7),
              y: withGridOffset(3),
              direction: "down",
            },
          ],
        },
      ],
      [asGridCoord(10, 6)]: [
        {
          events: [
            { type: "addStoryFlag", flag: "SEEN_INTRO" },
            {
              type: "textMessage",
              text: "* You are chopping ingredients on your first day as a Pizza Chef at a famed establishment in town. *",
            },
            { type: "walk", target: "kitchenNpcA", direction: "down" },
            {
              type: "stand",
              target: "kitchenNpcA",
              direction: "right",
              time: 200,
            },
            { type: "stand", target: "hero", direction: "left", time: 200 },
            { type: "textMessage", text: "Ahem. Is this your best work?" },
            {
              type: "textMessage",
              text: "These pepperonis are completely unstable! The pepper shapes are all wrong!",
            },
            {
              type: "textMessage",
              text: "Don't even get me started on the mushrooms.",
            },
            { type: "textMessage", text: "You will never make it in pizza!" },
            {
              type: "stand",
              target: "kitchenNpcA",
              direction: "right",
              time: 200,
            },
            { type: "walk", target: "kitchenNpcA", direction: "up" },
            {
              type: "stand",
              target: "kitchenNpcA",
              direction: "up",
              time: 300,
            },
            { type: "stand", target: "hero", direction: "down", time: 400 },
            {
              type: "textMessage",
              text: "* The competition is fierce! You should spend some time leveling up your Pizza lineup and skills. *",
            },
            {
              type: "changeMap",
              map: "Street",
              x: withGridOffset(5),
              y: withGridOffset(10),
              direction: "down",
            },
          ],
        },
      ],
    },
    walls: {
      [asGridCoord(2, 4)]: true,
      [asGridCoord(3, 4)]: true,
      [asGridCoord(5, 4)]: true,
      [asGridCoord(6, 4)]: true,
      [asGridCoord(7, 4)]: true,
      [asGridCoord(8, 4)]: true,
      [asGridCoord(11, 4)]: true,
      [asGridCoord(11, 5)]: true,
      [asGridCoord(12, 5)]: true,
      [asGridCoord(1, 5)]: true,
      [asGridCoord(1, 6)]: true,
      [asGridCoord(1, 7)]: true,
      [asGridCoord(1, 9)]: true,
      [asGridCoord(2, 9)]: true,
      [asGridCoord(6, 7)]: true,
      [asGridCoord(7, 7)]: true,
      [asGridCoord(9, 7)]: true,
      [asGridCoord(10, 7)]: true,
      [asGridCoord(9, 9)]: true,
      [asGridCoord(10, 9)]: true,
      [asGridCoord(3, 10)]: true,
      [asGridCoord(4, 10)]: true,
      [asGridCoord(6, 10)]: true,
      [asGridCoord(7, 10)]: true,
      [asGridCoord(8, 10)]: true,
      [asGridCoord(11, 10)]: true,
      [asGridCoord(12, 10)]: true,

      [asGridCoord(0, 8)]: true,
      [asGridCoord(5, 11)]: true,

      [asGridCoord(4, 3)]: true,
      [asGridCoord(9, 4)]: true,
      [asGridCoord(10, 4)]: true,

      [asGridCoord(13, 6)]: true,
      [asGridCoord(13, 7)]: true,
      [asGridCoord(13, 8)]: true,
      [asGridCoord(13, 9)]: true,
    },
  },
  Street: {
    id: "Street",
    lowerSrc: import.meta.env.BASE_URL + "images/maps/StreetLower.png",
    upperSrc: import.meta.env.BASE_URL + "images/maps/StreetUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: withGridOffset(30),
        y: withGridOffset(10),
      }),
      streetNpcA: new Person({
        x: withGridOffset(9),
        y: withGridOffset(11),
        src: import.meta.env.BASE_URL + "images/characters/people/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "right", time: 1400 },
          { type: "stand", direction: "up", time: 900 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "All ambitious pizza chefs gather on Anchovy Avenue.",
                faceHero: "streetNpcA",
              },
            ],
          },
        ],
      }),
      streetNpcB: new Person({
        x: withGridOffset(31),
        y: withGridOffset(12),
        src: import.meta.env.BASE_URL + "images/characters/people/npc7.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400 },
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "down", time: 400 },
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "right", time: 800 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "I can't decide on my favorite toppings.",
                faceHero: "streetNpcB",
              },
            ],
          },
        ],
      }),
      streetNpcC: new Person({
        x: withGridOffset(22),
        y: withGridOffset(10),
        src: import.meta.env.BASE_URL + "images/characters/people/npc8.png",
        talking: [
          {
            required: ["streetBattle"],
            events: [
              {
                type: "textMessage",
                text: "You are quite capable.",
                faceHero: "streetNpcC",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "You should have just stayed home!",
                faceHero: "streetNpcC",
              },
              { type: "battle", enemyId: "streetBattle" },
              { type: "addStoryFlag", flag: "streetBattle" },
            ],
          },
        ],
      }),
    },
    walls: {
      [asGridCoord(4, 9)]: true,
      [asGridCoord(5, 8)]: true,
      [asGridCoord(6, 9)]: true,
      [asGridCoord(7, 9)]: true,
      [asGridCoord(8, 9)]: true,
      [asGridCoord(9, 9)]: true,
      [asGridCoord(10, 9)]: true,
      [asGridCoord(11, 9)]: true,
      [asGridCoord(12, 9)]: true,
      [asGridCoord(13, 8)]: true,
      [asGridCoord(14, 8)]: true,
      [asGridCoord(15, 7)]: true,
      [asGridCoord(16, 7)]: true,
      [asGridCoord(17, 7)]: true,
      [asGridCoord(18, 7)]: true,
      [asGridCoord(19, 7)]: true,
      [asGridCoord(20, 7)]: true,
      [asGridCoord(21, 7)]: true,
      [asGridCoord(22, 7)]: true,
      [asGridCoord(23, 7)]: true,
      [asGridCoord(24, 7)]: true,
      [asGridCoord(24, 6)]: true,
      [asGridCoord(24, 5)]: true,
      [asGridCoord(26, 5)]: true,
      [asGridCoord(26, 6)]: true,
      [asGridCoord(26, 7)]: true,
      [asGridCoord(27, 7)]: true,
      [asGridCoord(28, 8)]: true,
      [asGridCoord(28, 9)]: true,
      [asGridCoord(29, 8)]: true,
      [asGridCoord(30, 9)]: true,
      [asGridCoord(31, 9)]: true,
      [asGridCoord(32, 9)]: true,
      [asGridCoord(33, 9)]: true,
      [asGridCoord(16, 9)]: true,
      [asGridCoord(17, 9)]: true,
      [asGridCoord(25, 9)]: true,
      [asGridCoord(26, 9)]: true,
      [asGridCoord(16, 10)]: true,
      [asGridCoord(17, 10)]: true,
      [asGridCoord(25, 10)]: true,
      [asGridCoord(26, 10)]: true,
      [asGridCoord(16, 11)]: true,
      [asGridCoord(17, 11)]: true,
      [asGridCoord(25, 11)]: true,
      [asGridCoord(26, 11)]: true,
      [asGridCoord(18, 11)]: true,
      [asGridCoord(19, 11)]: true,
      [asGridCoord(4, 14)]: true,
      [asGridCoord(5, 14)]: true,
      [asGridCoord(6, 14)]: true,
      [asGridCoord(7, 14)]: true,
      [asGridCoord(8, 14)]: true,
      [asGridCoord(9, 14)]: true,
      [asGridCoord(10, 14)]: true,
      [asGridCoord(11, 14)]: true,
      [asGridCoord(12, 14)]: true,
      [asGridCoord(13, 14)]: true,
      [asGridCoord(14, 14)]: true,
      [asGridCoord(15, 14)]: true,
      [asGridCoord(16, 14)]: true,
      [asGridCoord(17, 14)]: true,
      [asGridCoord(18, 14)]: true,
      [asGridCoord(19, 14)]: true,
      [asGridCoord(20, 14)]: true,
      [asGridCoord(21, 14)]: true,
      [asGridCoord(22, 14)]: true,
      [asGridCoord(23, 14)]: true,
      [asGridCoord(24, 14)]: true,
      [asGridCoord(25, 14)]: true,
      [asGridCoord(26, 14)]: true,
      [asGridCoord(27, 14)]: true,
      [asGridCoord(28, 14)]: true,
      [asGridCoord(29, 14)]: true,
      [asGridCoord(30, 14)]: true,
      [asGridCoord(31, 14)]: true,
      [asGridCoord(32, 14)]: true,
      [asGridCoord(33, 14)]: true,
      [asGridCoord(3, 10)]: true,
      [asGridCoord(3, 11)]: true,
      [asGridCoord(3, 12)]: true,
      [asGridCoord(3, 13)]: true,
      [asGridCoord(34, 10)]: true,
      [asGridCoord(34, 11)]: true,
      [asGridCoord(34, 12)]: true,
      [asGridCoord(34, 13)]: true,
      [asGridCoord(29, 8)]: true,
      [asGridCoord(25, 4)]: true,
    },
    cutsceneSpaces: {
      [asGridCoord(5, 9)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "DiningRoom",
              x: withGridOffset(6),
              y: withGridOffset(12),
              direction: "up",
            },
          ],
        },
      ],
      [asGridCoord(29, 9)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Shop",
              x: withGridOffset(5),
              y: withGridOffset(12),
              direction: "up",
            },
          ],
        },
      ],
      [asGridCoord(25, 5)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "StreetNorth",
              x: withGridOffset(7),
              y: withGridOffset(16),
              direction: "up",
            },
          ],
        },
      ],
    },
  },
  Shop: {
    id: "Shop",
    lowerSrc: import.meta.env.BASE_URL + "images/maps/PizzaShopLower.png",
    upperSrc: import.meta.env.BASE_URL + "images/maps/PizzaShopUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: withGridOffset(3),
        y: withGridOffset(7),
      }),
      shopNpcA: new Person({
        x: withGridOffset(6),
        y: withGridOffset(5),
        src: import.meta.env.BASE_URL + "images/characters/people/erio.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "All of the chef rivalries have been good for business.",
                faceHero: "shopNpcA",
              },
            ],
          },
        ],
      }),
      shopNpcB: new Person({
        x: withGridOffset(5),
        y: withGridOffset(9),
        src: import.meta.env.BASE_URL + "images/characters/people/npc2.png",
        behaviorLoop: [{ type: "stand", direction: "left", time: 400 }],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Which peel will make me a better chef?",
                faceHero: "shopNpcB",
              },
            ],
          },
        ],
      }),
      pizzaStone: new PizzaStone({
        x: withGridOffset(1),
        y: withGridOffset(4),
        storyFlag: "STONE_SHOP",
        pizzas: ["v002", "f002"],
      }),
    },
    cutsceneSpaces: {
      [asGridCoord(5, 12)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Street",
              x: withGridOffset(29),
              y: withGridOffset(9),
              direction: "down",
            },
          ],
        },
      ],
    },
    walls: {
      [asGridCoord(2, 4)]: true,
      [asGridCoord(2, 5)]: true,
      [asGridCoord(2, 6)]: true,
      [asGridCoord(3, 6)]: true,
      [asGridCoord(4, 6)]: true,
      [asGridCoord(5, 6)]: true,
      [asGridCoord(7, 6)]: true,
      [asGridCoord(8, 6)]: true,
      [asGridCoord(9, 6)]: true,
      [asGridCoord(9, 5)]: true,
      [asGridCoord(9, 4)]: true,
      [asGridCoord(3, 8)]: true,
      [asGridCoord(3, 9)]: true,
      [asGridCoord(3, 10)]: true,
      [asGridCoord(4, 8)]: true,
      [asGridCoord(4, 9)]: true,
      [asGridCoord(4, 10)]: true,
      [asGridCoord(7, 8)]: true,
      [asGridCoord(7, 9)]: true,
      [asGridCoord(8, 8)]: true,
      [asGridCoord(8, 9)]: true,
      [asGridCoord(1, 12)]: true,
      [asGridCoord(2, 12)]: true,
      [asGridCoord(3, 12)]: true,
      [asGridCoord(4, 12)]: true,
      [asGridCoord(6, 12)]: true,
      [asGridCoord(7, 12)]: true,
      [asGridCoord(8, 12)]: true,
      [asGridCoord(9, 12)]: true,
      [asGridCoord(10, 12)]: true,
      [asGridCoord(0, 4)]: true,
      [asGridCoord(0, 5)]: true,
      [asGridCoord(0, 6)]: true,
      [asGridCoord(0, 7)]: true,
      [asGridCoord(0, 8)]: true,
      [asGridCoord(0, 9)]: true,
      [asGridCoord(0, 10)]: true,
      [asGridCoord(0, 11)]: true,
      [asGridCoord(11, 4)]: true,
      [asGridCoord(11, 5)]: true,
      [asGridCoord(11, 6)]: true,
      [asGridCoord(11, 7)]: true,
      [asGridCoord(11, 8)]: true,
      [asGridCoord(11, 9)]: true,
      [asGridCoord(11, 10)]: true,
      [asGridCoord(11, 11)]: true,

      [asGridCoord(1, 3)]: true,
      [asGridCoord(2, 3)]: true,
      [asGridCoord(3, 3)]: true,
      [asGridCoord(4, 3)]: true,
      [asGridCoord(5, 3)]: true,
      [asGridCoord(6, 3)]: true,
      [asGridCoord(7, 3)]: true,
      [asGridCoord(8, 3)]: true,
      [asGridCoord(9, 3)]: true,
      [asGridCoord(10, 3)]: true,

      [asGridCoord(5, 13)]: true,
    },
  },
  GreenKitchen: {
    id: "GreenKitchen",
    lowerSrc: import.meta.env.BASE_URL + "images/maps/GreenKitchenLower.png",
    upperSrc: import.meta.env.BASE_URL + "images/maps/GreenKitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: withGridOffset(3),
        y: withGridOffset(8),
      }),
      greenKitchenNpcA: new Person({
        x: withGridOffset(8),
        y: withGridOffset(8),
        src: import.meta.env.BASE_URL + "images/characters/people/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400 },
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "down", time: 400 },
          { type: "stand", direction: "left", time: 800 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Chef Rootie uses the best seasoning.",
                faceHero: "greenKitchenNpcA",
              },
            ],
          },
        ],
      }),
      greenKitchenNpcB: new Person({
        x: withGridOffset(1),
        y: withGridOffset(8),
        src: import.meta.env.BASE_URL + "images/characters/people/npc3.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 900 },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "stand", direction: "right", time: 800 },
          { type: "stand", direction: "down", time: 400 },
          { type: "stand", direction: "right", time: 800 },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "up", time: 600 },
          { type: "stand", direction: "right", time: 900 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Finally... a pizza place that gets me!",
                faceHero: "greenKitchenNpcB",
              },
            ],
          },
        ],
      }),
      greenKitchenNpcC: new Person({
        x: withGridOffset(3),
        y: withGridOffset(5),
        src:
          import.meta.env.BASE_URL + "images/characters/people/secondBoss.png",
        talking: [
          {
            required: ["chefRootie"],
            events: [
              {
                type: "textMessage",
                faceHero: "greenKitchenNpcC",
                text: "My veggies need more growth.",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "Veggies are the fuel for the heart and soul!",
                faceHero: "greenKitchenNpcC",
              },
              { type: "battle", enemyId: "chefRootie" },
              { type: "addStoryFlag", flag: "chefRootie" },
            ],
          },
        ],
      }),
    },
    cutsceneSpaces: {
      [asGridCoord(5, 12)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "StreetNorth",
              x: withGridOffset(7),
              y: withGridOffset(5),
              direction: "down",
            },
          ],
        },
      ],
    },
    walls: {
      [asGridCoord(1, 4)]: true,
      [asGridCoord(3, 4)]: true,
      [asGridCoord(4, 4)]: true,
      [asGridCoord(6, 4)]: true,
      [asGridCoord(7, 4)]: true,
      [asGridCoord(8, 5)]: true,
      [asGridCoord(9, 4)]: true,
      [asGridCoord(1, 6)]: true,
      [asGridCoord(2, 6)]: true,
      [asGridCoord(3, 6)]: true,
      [asGridCoord(4, 6)]: true,
      [asGridCoord(5, 6)]: true,
      [asGridCoord(6, 6)]: true,
      [asGridCoord(3, 7)]: true,
      [asGridCoord(4, 7)]: true,
      [asGridCoord(6, 7)]: true,
      [asGridCoord(2, 9)]: true,
      [asGridCoord(3, 9)]: true,
      [asGridCoord(4, 9)]: true,
      [asGridCoord(7, 10)]: true,
      [asGridCoord(8, 10)]: true,
      [asGridCoord(9, 10)]: true,
      [asGridCoord(1, 12)]: true,
      [asGridCoord(2, 12)]: true,
      [asGridCoord(3, 12)]: true,
      [asGridCoord(4, 12)]: true,
      [asGridCoord(6, 12)]: true,
      [asGridCoord(7, 12)]: true,
      [asGridCoord(8, 12)]: true,
      [asGridCoord(9, 12)]: true,
      [asGridCoord(0, 5)]: true,
      [asGridCoord(0, 6)]: true,
      [asGridCoord(0, 7)]: true,
      [asGridCoord(0, 8)]: true,
      [asGridCoord(0, 9)]: true,
      [asGridCoord(0, 10)]: true,
      [asGridCoord(0, 11)]: true,
      [asGridCoord(10, 5)]: true,
      [asGridCoord(10, 6)]: true,
      [asGridCoord(10, 7)]: true,
      [asGridCoord(10, 8)]: true,
      [asGridCoord(10, 9)]: true,
      [asGridCoord(10, 10)]: true,
      [asGridCoord(10, 11)]: true,
      [asGridCoord(5, 13)]: true,
    },
  },
  StreetNorth: {
    id: "StreetNorth",
    lowerSrc: import.meta.env.BASE_URL + "images/maps/StreetNorthLower.png",
    upperSrc: import.meta.env.BASE_URL + "images/maps/StreetNorthUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: withGridOffset(3),
        y: withGridOffset(8),
      }),
      streetNorthNpcA: new Person({
        x: withGridOffset(9),
        y: withGridOffset(6),
        src: import.meta.env.BASE_URL + "images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "walk", direction: "left" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "right" },
          { type: "stand", direction: "right", time: 800 },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "up", time: 400 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "This place is famous for veggie pizzas!",
                faceHero: "streetNorthNpcA",
              },
            ],
          },
        ],
      }),
      streetNorthNpcB: new Person({
        x: withGridOffset(4),
        y: withGridOffset(12),
        src: import.meta.env.BASE_URL + "images/characters/people/npc3.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400 },
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "down", time: 400 },
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "right", time: 800 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "I love the fresh smell of garlic in the air.",
                faceHero: "streetNorthNpcB",
              },
            ],
          },
        ],
      }),
      streetNorthNpcC: new Person({
        x: withGridOffset(12),
        y: withGridOffset(9),
        src: import.meta.env.BASE_URL + "images/characters/people/npc8.png",
        talking: [
          {
            required: ["streetNorthBattle"],
            events: [
              {
                type: "textMessage",
                text: "Could you be the Legendary one?",
                faceHero: "streetNorthNpcC",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "This is my turf!",
                faceHero: "streetNorthNpcC",
              },
              { type: "battle", enemyId: "streetNorthBattle" },
              { type: "addStoryFlag", flag: "streetNorthBattle" },
            ],
          },
        ],
      }),
      pizzaStone: new PizzaStone({
        x: withGridOffset(2),
        y: withGridOffset(9),
        storyFlag: "STONE_STREET_NORTH",
        pizzas: ["v001", "f001"],
      }),
    },
    walls: {
      [asGridCoord(2, 7)]: true,
      [asGridCoord(3, 7)]: true,
      [asGridCoord(3, 6)]: true,
      [asGridCoord(4, 5)]: true,
      [asGridCoord(5, 5)]: true,
      [asGridCoord(6, 5)]: true,
      [asGridCoord(8, 5)]: true,
      [asGridCoord(9, 5)]: true,
      [asGridCoord(10, 5)]: true,
      [asGridCoord(11, 6)]: true,
      [asGridCoord(12, 6)]: true,
      [asGridCoord(13, 6)]: true,
      [asGridCoord(7, 8)]: true,
      [asGridCoord(8, 8)]: true,
      [asGridCoord(7, 9)]: true,
      [asGridCoord(8, 9)]: true,
      [asGridCoord(7, 10)]: true,
      [asGridCoord(8, 10)]: true,
      [asGridCoord(9, 10)]: true,
      [asGridCoord(10, 10)]: true,
      [asGridCoord(2, 15)]: true,
      [asGridCoord(3, 15)]: true,
      [asGridCoord(4, 15)]: true,
      [asGridCoord(5, 15)]: true,
      [asGridCoord(6, 15)]: true,
      [asGridCoord(6, 16)]: true,
      [asGridCoord(8, 16)]: true,
      [asGridCoord(8, 15)]: true,
      [asGridCoord(9, 15)]: true,
      [asGridCoord(10, 15)]: true,
      [asGridCoord(11, 15)]: true,
      [asGridCoord(12, 15)]: true,
      [asGridCoord(13, 15)]: true,

      [asGridCoord(1, 8)]: true,
      [asGridCoord(1, 9)]: true,
      [asGridCoord(1, 10)]: true,
      [asGridCoord(1, 11)]: true,
      [asGridCoord(1, 12)]: true,
      [asGridCoord(1, 13)]: true,
      [asGridCoord(1, 14)]: true,

      [asGridCoord(14, 7)]: true,
      [asGridCoord(14, 8)]: true,
      [asGridCoord(14, 9)]: true,
      [asGridCoord(14, 10)]: true,
      [asGridCoord(14, 11)]: true,
      [asGridCoord(14, 12)]: true,
      [asGridCoord(14, 13)]: true,
      [asGridCoord(14, 14)]: true,

      [asGridCoord(7, 17)]: true,
      [asGridCoord(7, 4)]: true,
    },
    cutsceneSpaces: {
      [asGridCoord(7, 5)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "GreenKitchen",
              x: withGridOffset(5),
              y: withGridOffset(12),
              direction: "up",
            },
          ],
        },
      ],
      [asGridCoord(7, 16)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Street",
              x: withGridOffset(25),
              y: withGridOffset(5),
              direction: "down",
            },
          ],
        },
      ],
    },
  },
  DiningRoom: {
    id: "DiningRoom",
    lowerSrc: import.meta.env.BASE_URL + "images/maps/DiningRoomLower.png",
    upperSrc: import.meta.env.BASE_URL + "images/maps/DiningRoomUpper.png",

    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: withGridOffset(5),
        y: withGridOffset(8),
      }),
      diningRoomNpcA: new Person({
        x: withGridOffset(12),
        y: withGridOffset(8),
        src: import.meta.env.BASE_URL + "images/characters/people/npc8.png",
        talking: [
          {
            required: ["diningRoomBattle"],
            events: [
              {
                type: "textMessage",
                text: "Maybe I am not ready for this place.",
                faceHero: "diningRoomNpcA",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "You think you have what it takes to cook here?!",
                faceHero: "diningRoomNpcA",
              },
              {
                type: "battle",
                enemyId: "diningRoomBattle",
              },
              { type: "addStoryFlag", flag: "diningRoomBattle" },
            ],
          },
        ],
      }),
      diningRoomNpcB: new Person({
        x: withGridOffset(9),
        y: withGridOffset(5),
        src: import.meta.env.BASE_URL + "images/characters/people/npc4.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "People come from all over to dine here.",
                faceHero: "diningRoomNpcB",
              },
            ],
          },
        ],
      }),
      diningRoomNpcC: new Person({
        x: withGridOffset(2),
        y: withGridOffset(8),
        src: import.meta.env.BASE_URL + "images/characters/people/npc7.png",
        behaviorLoop: [
          { type: "stand", direction: "right", time: 800 },
          { type: "stand", direction: "down", time: 700 },
          { type: "stand", direction: "right", time: 800 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "I was so lucky to score a reservation!",
                faceHero: "diningRoomNpcC",
              },
            ],
          },
        ],
      }),
      diningRoomNpcD: new Person({
        x: withGridOffset(8),
        y: withGridOffset(9),
        src: import.meta.env.BASE_URL + "images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "right", time: 1200 },
          { type: "stand", direction: "down", time: 900 },
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "down", time: 700 },
          { type: "stand", direction: "right", time: 400 },
          { type: "stand", direction: "up", time: 800 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "I've been dreaming of this pizza for weeks!",
                faceHero: "diningRoomNpcD",
              },
            ],
          },
        ],
      }),
    },
    cutsceneSpaces: {
      [asGridCoord(7, 3)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Kitchen",
              x: withGridOffset(5),
              y: withGridOffset(10),
              direction: "up",
            },
          ],
        },
      ],
      [asGridCoord(6, 12)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Street",
              x: withGridOffset(5),
              y: withGridOffset(9),
              direction: "down",
            },
          ],
        },
      ],
    },
    walls: {
      [asGridCoord(6, 3)]: true,
      [asGridCoord(7, 2)]: true,
      [asGridCoord(6, 13)]: true,
      [asGridCoord(1, 5)]: true,
      [asGridCoord(2, 5)]: true,
      [asGridCoord(3, 5)]: true,
      [asGridCoord(4, 5)]: true,
      [asGridCoord(4, 4)]: true,
      [asGridCoord(5, 3)]: true,
      [asGridCoord(6, 4)]: true,
      [asGridCoord(6, 5)]: true,
      [asGridCoord(8, 3)]: true,
      [asGridCoord(9, 4)]: true,
      [asGridCoord(10, 5)]: true,
      [asGridCoord(11, 5)]: true,
      [asGridCoord(12, 5)]: true,
      [asGridCoord(11, 7)]: true,
      [asGridCoord(12, 7)]: true,
      [asGridCoord(2, 7)]: true,
      [asGridCoord(3, 7)]: true,
      [asGridCoord(4, 7)]: true,
      [asGridCoord(7, 7)]: true,
      [asGridCoord(8, 7)]: true,
      [asGridCoord(9, 7)]: true,
      [asGridCoord(2, 10)]: true,
      [asGridCoord(3, 10)]: true,
      [asGridCoord(4, 10)]: true,
      [asGridCoord(7, 10)]: true,
      [asGridCoord(8, 10)]: true,
      [asGridCoord(9, 10)]: true,
      [asGridCoord(1, 12)]: true,
      [asGridCoord(2, 12)]: true,
      [asGridCoord(3, 12)]: true,
      [asGridCoord(4, 12)]: true,
      [asGridCoord(5, 12)]: true,
      [asGridCoord(7, 12)]: true,
      [asGridCoord(8, 12)]: true,
      [asGridCoord(9, 12)]: true,
      [asGridCoord(10, 12)]: true,
      [asGridCoord(11, 12)]: true,
      [asGridCoord(12, 12)]: true,
      [asGridCoord(0, 4)]: true,
      [asGridCoord(0, 5)]: true,
      [asGridCoord(0, 6)]: true,
      [asGridCoord(0, 8)]: true,
      [asGridCoord(0, 9)]: true,
      [asGridCoord(0, 10)]: true,
      [asGridCoord(0, 11)]: true,
      [asGridCoord(13, 4)]: true,
      [asGridCoord(13, 5)]: true,
      [asGridCoord(13, 6)]: true,
      [asGridCoord(13, 8)]: true,
      [asGridCoord(13, 9)]: true,
      [asGridCoord(13, 10)]: true,
      [asGridCoord(13, 11)]: true,
    },
  },
};
