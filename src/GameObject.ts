import { Sprite } from "./Sprite";

export type GameObjectConfig = {
  x: number;
  y: number;
  direction?: "up" | "down" | "left" | "right";
  src?: string;
};

export class GameObject {
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
  sprite: Sprite;

  constructor(config: GameObjectConfig) {
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.direction = config.direction ?? "down";
    this.sprite = new Sprite({
      gameObject: this,
      src:
        config.src ??
        import.meta.env.BASE_URL + "images/characters/people/hero.png",
    });
  }

  // For now, this is just a stub to be overridden by subclasses
  // @ts-expect-error
  update(state) {
    // Code here
  }
}
