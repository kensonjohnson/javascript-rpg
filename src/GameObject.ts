import { Sprite } from "./Sprite";
import type { OverworldMap } from "./OverworldMap";

export type GameObjectConfig = {
  x: number;
  y: number;
  direction?: "up" | "down" | "left" | "right";
  src?: string;
  behaviorLoop?: Behavior[];
};

type Behavior = {
  type: string;
  direction: "up" | "down" | "left" | "right";
  time?: number;
};

export class GameObject {
  id: string | null;
  isMounted: boolean;
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
  sprite: Sprite;
  behaviorLoop: Behavior[];
  behaviorLoopIndex: number;

  constructor(config: GameObjectConfig) {
    this.id = null;
    this.isMounted = false;
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
  }

  mount(map: OverworldMap) {
    this.isMounted = true;
    map.addWall(this.x, this.y);
  }

  // For now, this is just a stub to be overridden by subclasses
  // @ts-expect-error
  update(state) {}
}
