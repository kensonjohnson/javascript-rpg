import { DirectionInput } from "./DirectionInput";
import { OverworldMap, OverworldMapConfig } from "./OverworldMap";
import type { GameObject } from "./GameObject";
import type { ValidDirection } from "./Person";
import { KeyPressListener } from "./KeyPressListener";

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

    requestAnimationFrame(() => this.gameLoop());
  }

  bindActionInput() {
    new KeyPressListener("Space", () => {
      this.map!.checkForActionCutscene();
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

  startMap(mapConfig: OverworldMapConfig) {
    this.map = new OverworldMap(mapConfig);
    this.map.overworld = this;
    this.cameraPerson = this.map.gameObjects["hero"];
    // Mount the game objects
    this.map.mountObjects();
  }

  init() {
    this.startMap(window.OverworldMaps.DemoRoom);

    this.bindActionInput();
    this.bindHeroPositionCheck();

    // Start the direction controls
    this.directionInput.init();

    // Start game loop
    this.gameLoop();

    this.map!.startCutscene([
      { target: "npc1", type: "walk", direction: "left" },
      { target: "npc1", type: "walk", direction: "left" },
      { target: "npc1", type: "walk", direction: "up" },
      { target: "npc1", type: "walk", direction: "up" },
      { type: "textMessage", text: "Press SPACE to close this text box!" },
      { target: "npc1", type: "walk", direction: "down" },
      { target: "npc1", type: "walk", direction: "down" },
      { target: "npc1", type: "walk", direction: "right" },
      { target: "npc1", type: "walk", direction: "right" },
    ]);
  }
}
