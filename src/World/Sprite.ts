import { spriteSize } from "./Config";
import { withGridOffset } from "../utils";
import type { GameObject } from "./GameObject";

type SpriteConfig = {
  src: string;
  useShadow?: boolean;
  animations?: any;
  currentAnimation?: string;
  animationFrameLimit?: number;
  gameObject: GameObject;
};

export class Sprite {
  image: HTMLImageElement;
  isLoaded: boolean | undefined;
  shadow: HTMLImageElement;
  useShadow: boolean;
  isShadowLoaded: boolean | undefined;
  animations: { [key: string]: number[][] };
  currentAnimation: keyof typeof this.animations;
  currentAnimationFrame: number;
  animationFrameLimit: number;
  animationFrameProgress: number;
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
        import.meta.env.BASE_URL + "images/characters/shadow.png";
    }
    this.shadow.onload = () => {
      this.isShadowLoaded = true;
    };

    // Configure animations and initial state
    this.animations = config.animations ?? {
      "idle-down": [[0, 0]],
      "idle-right": [[0, 1]],
      "idle-up": [[0, 2]],
      "idle-left": [[0, 3]],
      "walk-down": [
        [1, 0],
        [0, 0],
        [3, 0],
        [0, 0],
      ],
      "walk-right": [
        [1, 1],
        [0, 1],
        [3, 1],
        [0, 1],
      ],
      "walk-up": [
        [1, 2],
        [0, 2],
        [3, 2],
        [0, 2],
      ],
      "walk-left": [
        [1, 3],
        [0, 3],
        [3, 3],
        [0, 3],
      ],
    };
    this.currentAnimation = config.currentAnimation ?? "idle-down";
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit ?? 8;
    this.animationFrameProgress = this.animationFrameLimit;

    this.gameObject = config.gameObject;
  }

  get frame() {
    return this.animations[this.currentAnimation][this.currentAnimationFrame];
  }

  setAnimation(key: keyof typeof this.animations) {
    if (this.currentAnimation !== key) {
      this.currentAnimation = key;
      this.currentAnimationFrame = 0;
      this.animationFrameProgress = this.animationFrameLimit;
    }
  }

  updateAnimationProgress() {
    // Downtick the animation frame progress
    if (this.animationFrameProgress > 0) {
      this.animationFrameProgress--;
      return;
    }

    // Reset the animation frame progress
    this.animationFrameProgress = this.animationFrameLimit;
    this.currentAnimationFrame++;

    if (this.frame === undefined) {
      this.currentAnimationFrame = 0;
    }
  }

  draw(context: CanvasRenderingContext2D, cameraPerson: GameObject) {
    if (!this.isLoaded) return;
    const x = this.gameObject.x - 8 + withGridOffset(10.5) - cameraPerson.x;
    const y = this.gameObject.y - 18 + withGridOffset(6) - cameraPerson.y;

    this.isShadowLoaded && context.drawImage(this.shadow, x, y);

    const [frameX, frameY] = this.frame;

    context.drawImage(
      this.image,
      frameX * spriteSize,
      frameY * spriteSize,
      spriteSize,
      spriteSize,
      x,
      y,
      spriteSize,
      spriteSize
    );

    this.updateAnimationProgress();
  }
}
