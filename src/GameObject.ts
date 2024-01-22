import { Sprite } from "./Sprite";

type GameObjectConfig = {
  x: number;
  y: number;
  src?: string;
};

export class GameObject {
  x: number;
  y: number;
  sprite: Sprite;

  constructor(config: GameObjectConfig) {
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src ?? "/images/characters/people/hero.png",
    });
  }
}
