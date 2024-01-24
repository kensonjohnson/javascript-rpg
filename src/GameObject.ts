import { Sprite } from "./Sprite";
import { OverworldEvent } from "./OverworldEvent";
import type { OverworldMap } from "./OverworldMap";
import type { ValidEvent } from "./OverworldEvent";

export type GameObjectConfig = {
  x: number;
  y: number;
  direction?: "up" | "down" | "left" | "right";
  src?: string;
  behaviorLoop?: BehaviorConfig[];
  talking?: [{ events: ValidEvent[] }];
};

type BehaviorConfig = {
  target?: string;
  type: "walk" | "stand";
  direction: "up" | "down" | "left" | "right";
  time?: number;
};

export class GameObject {
  id: string | null;
  isMounted: boolean;
  isStanding: boolean;
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
  sprite: Sprite;
  behaviorLoop: BehaviorConfig[];
  behaviorLoopIndex: number;
  talking: { events: ValidEvent[] }[];

  constructor(config: GameObjectConfig) {
    this.id = null;
    this.isMounted = false;
    this.isStanding = false;
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.direction = config.direction ?? "down";
    this.sprite = new Sprite({
      gameObject: this,
      src:
        config.src ??
        import.meta.env.BASE_URL + "images/characters/people/hero.png",
    });

    this.behaviorLoop = config.behaviorLoop ?? [];
    this.behaviorLoopIndex = 0;

    this.talking = config.talking ?? [];
  }

  mount(map: OverworldMap) {
    this.isMounted = true;
    map.addWall(this.x, this.y);

    // If we have a behavior loop, start it after short delay

    setTimeout(() => {
      this.doBehaviorEvent(map);
    }, 50);
  }

  async doBehaviorEvent(map: OverworldMap) {
    // Short circuit if global cutscene is running
    // or if we have no behavior loop
    if (
      map.isCutscenePlaying ||
      this.behaviorLoop.length === 0 ||
      this.isStanding
    ) {
      return;
    }

    // Grab the event config for this loop
    const eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
    eventConfig.target = this.id as string;

    // Create the event handler out of next event config
    const eventHandler = new OverworldEvent({
      map,
      event: eventConfig as ValidEvent,
    });
    await eventHandler.init();

    // Increment the loop, reset if we're at the end
    // Sets the next event to fire
    this.behaviorLoopIndex++;
    if (this.behaviorLoopIndex === this.behaviorLoop.length) {
      this.behaviorLoopIndex = 0;
    }

    // Continue the loop
    this.doBehaviorEvent(map);
  }
}
