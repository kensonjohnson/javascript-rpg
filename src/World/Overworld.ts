import { DirectionInput } from "./DirectionInput";
import { OverworldMap, OverworldMapConfig } from "./OverworldMap";
import type { GameObject } from "./GameObject";
import type { ValidDirection } from "./Person";
import { KeyPressListener } from "./KeyPressListener";
import { Hud } from "./Hud";
import { Progress } from "@/State/Progress";

type OverworldConfig = {
  element: HTMLElement;
};

export class Overworld {
  element: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  map: OverworldMap | null;
  directionInput: DirectionInput;
  cameraPerson: GameObject | null;
  timestamp: number;
  hud: Hud;
  progress: Progress;

  constructor(config: OverworldConfig) {
    this.element = config.element;
    this.canvas = this.element.querySelector(
      ".game-canvas"
    ) as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.map = null;
    this.cameraPerson = null;
    this.timestamp = 0;
    this.directionInput = new DirectionInput();
    this.hud = new Hud();
    this.progress = new Progress();
  }

  gameLoop() {
    // Find the time since the last frame
    const now = Date.now();
    const delta = now - this.timestamp;

    // If the time since the last frame is too short, don't update
    if (delta < 1000 / 60) {
      requestAnimationFrame(() => this.gameLoop());
      return;
    }

    // Update the timestamp
    this.timestamp = now;

    // Clear the canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    Object.values(this.map!.gameObjects ?? {}).forEach((gameObject) => {
      gameObject.update({
        arrow: this.directionInput!.direction as ValidDirection,
        map: this.map as OverworldMap,
      });
    });

    // Draw lower image
    this.map!.drawLowerImage(this.context, this.cameraPerson as GameObject);

    // Draw game objects
    Object.values(this.map!.gameObjects ?? {})
      .sort((a, b) => {
        return a.y - b.y;
      })
      .forEach((gameObject) => {
        gameObject.sprite.draw(this.context, this.cameraPerson as GameObject);
      });

    // Draw upper image
    this.map!.drawUpperImage(this.context, this.cameraPerson as GameObject);

    if (!this.map?.isPaused) {
      requestAnimationFrame(() => this.gameLoop());
    }
  }

  bindActionInput() {
    new KeyPressListener("Space", () => {
      this.map!.checkForActionCutscene();
    });

    new KeyPressListener("Escape", () => {
      if (!this.map?.isCutscenePlaying) {
        this.map?.startCutscene([{ type: "pause" }]);
      }
    });
  }

  bindHeroPositionCheck() {
    document.addEventListener("PersonWalkingComplete", (event) => {
      // @ts-ignore
      if (event.detail.targetId === "hero") {
        this.map!.checkForFootstepCutscene();
      }
    });
  }

  startMap(
    mapConfig: OverworldMapConfig,
    heroInitialState?: { x: number; y: number; direction: ValidDirection }
  ) {
    this.map = new OverworldMap(mapConfig);
    this.map.overworld = this;
    this.cameraPerson = this.map.gameObjects["hero"];
    // Mount the game objects
    this.map.mountObjects();

    if (heroInitialState) {
      const { hero } = this.map.gameObjects;
      this.map.removeWall(hero.x, hero.y);
      hero.x = heroInitialState.x;
      hero.y = heroInitialState.y;
      hero.direction = heroInitialState.direction;
      this.map.addWall(hero.x, hero.y);
    }

    this.progress.mapId = mapConfig.id;
    this.progress.startingHeroX = this.map.gameObjects.hero.x;
    this.progress.startingHeroY = this.map.gameObjects.hero.y;
    this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
  }

  init() {
    // Check for saved data
    let initialHeroState = undefined;
    const saveFile = this.progress.getSaveFile();
    if (saveFile) {
      this.progress.load();
      initialHeroState = {
        x: this.progress.startingHeroX,
        y: this.progress.startingHeroY,
        direction: this.progress.startingHeroDirection as ValidDirection,
      };
    }

    // Initialize the HUD
    this.hud.init(document.querySelector(".game-container")!);

    // Start the first map
    this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);

    // Create controls
    this.bindActionInput();
    this.bindHeroPositionCheck();

    // Start the direction controls
    this.directionInput.init();

    // Start game loop
    this.gameLoop();

    // this.map!.startCutscene([
    //   { target: "npc1", type: "walk", direction: "left" },
    //   { target: "npc1", type: "walk", direction: "left" },
    //   { target: "npc1", type: "walk", direction: "up" },
    //   { target: "npc1", type: "walk", direction: "up" },
    //   { type: "textMessage", text: "Press SPACE to interact and to talk!" },
    //   { type: "textMessage", text: "Use the ARROW keys or WASD to follow me!" },
    //   { target: "npc1", type: "walk", direction: "down" },
    //   { target: "npc1", type: "walk", direction: "down" },
    //   { target: "npc1", type: "walk", direction: "right" },
    //   { target: "npc1", type: "walk", direction: "right" },
    // ]);
  }
}
