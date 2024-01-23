import { GameObject } from "./GameObject";
import type { GameObjectConfig } from "./GameObject";
import type { OverworldMap } from "./OverworldMap";
import { emitEvent } from "./utils";

export type ValidDirections = "up" | "down" | "left" | "right";

type PersonConfig = GameObjectConfig & {
  isPlayerControlled?: boolean;
};

export class Person extends GameObject {
  movingProgressRemaining: number;
  isPlayerControlled: boolean;
  directionUpdate: { [key in ValidDirections]: [string, number] };

  constructor(config: PersonConfig) {
    super(config);

    this.movingProgressRemaining = 0;

    this.isPlayerControlled = config.isPlayerControlled ?? false;

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };
  }

  update(state: { arrow: ValidDirections; map: OverworldMap }) {
    if (this.movingProgressRemaining > 0) {
      this.updatePosition();
    } else {
      // More cases for walk will come here

      // Case: We're keyboard ready and have an arrow pressed
      if (
        !state.map.isCutscenePlaying &&
        this.isPlayerControlled &&
        state.arrow
      ) {
        this.startBehavior(state.map, { type: "walk", direction: state.arrow });
      }

      this.updateSprite();
    }
  }

  startBehavior(
    map: OverworldMap,
    behavior: {
      type: string;
      direction: ValidDirections;
      time?: number;
      retry?: boolean;
    }
  ) {
    this.direction = behavior.direction;

    if (behavior.type === "walk") {
      if (map.isSpaceTaken(this.x, this.y, this.direction)) {
        if (behavior.retry) {
          setTimeout(() => {
            this.startBehavior(map, behavior);
          }, 100);
        }

        return;
      }
      map.moveWall(this.x, this.y, this.direction);
      this.movingProgressRemaining = 16;
      this.updateSprite();
    }

    if (behavior.type === "stand") {
      setTimeout(() => {
        emitEvent("PersonStandComplete", { targetId: this.id });
      }, behavior.time);
    }
  }

  updatePosition() {
    if (this.movingProgressRemaining > 0) {
      const [property, change] =
        this.directionUpdate[
          this.direction as keyof typeof this.directionUpdate
        ];
      this[property as "x" | "y"] += change;
      this.movingProgressRemaining--;

      if (this.movingProgressRemaining === 0) {
        // Finished behavior
        emitEvent("PersonWalkingComplete", { targetId: this.id });
      }
    }
  }

  updateSprite() {
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-" + this.direction);
      return;
    }
    this.sprite.setAnimation("idle-" + this.direction);
  }
}
