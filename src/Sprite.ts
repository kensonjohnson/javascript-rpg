import { GameObject } from "./GameObject";

type SpriteConfig = {
  src: string;
  useShadow?: boolean;
  animations?: any;
  currentAnimation?: string;
  currentAnimationFrame?: number;
  gameObject: GameObject;
};

export class Sprite {
  image: HTMLImageElement;
  isLoaded: boolean | undefined;
  shadow: HTMLImageElement;
  useShadow: boolean;
  isShadowLoaded: boolean | undefined;
  animations: any;
  currentAnimation: string;
  currentAnimationFrame: number;
  gameObject: GameObject;

  constructor(config: SpriteConfig) {
    // Set up the image
    this.image = new Image();
    this.image.src = config.src;
    this.image.onload = () => {
      this.isLoaded = true;
    };

    // Set up shadow
    this.shadow = new Image();
    this.useShadow = config.useShadow ?? true;
    if (this.useShadow) {
      this.shadow.src =
        import.meta.env.BASE_URL + "/images/characters/shadow.png";
    }
    this.shadow.onload = () => {
      this.isShadowLoaded = true;
    };

    // Configure animations and initial state
    this.animations = config.animations ?? {
      idleDown: [[0, 0]],
    };
    this.currentAnimation = config.currentAnimation ?? "idleDown";
    this.currentAnimationFrame = config.currentAnimationFrame ?? 0;

    this.gameObject = config.gameObject;
  }

  draw(context: CanvasRenderingContext2D) {
    if (!this.isLoaded) return;
    const x = this.gameObject.x * 16 - 8;
    const y = this.gameObject.y * 16 - 18;

    this.isShadowLoaded && context.drawImage(this.shadow, x, y);
    context.drawImage(this.image, 0, 0, 32, 32, x, y, 32, 32);
  }
}
