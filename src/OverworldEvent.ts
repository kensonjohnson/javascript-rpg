import type { OverworldMap } from "./OverworldMap";
import type { Person } from "./Person";

export type BehaviorEvent = {
  target: string;
  type: "walk" | "stand";
  direction: "up" | "down" | "left" | "right";
  time?: number;
};

export class OverworldEvent {
  map: OverworldMap;
  event: BehaviorEvent;
  constructor({ map, event }: { map: OverworldMap; event: BehaviorEvent }) {
    this.map = map;
    this.event = event;
  }

  stand(resolve: (value: unknown) => void) {}

  walk(resolve: (value: unknown) => void) {
    const target = this.map.gameObjects[this.event.target] as Person;
    target.startBehavior(this.map, {
      type: "walk",
      direction: this.event.direction,
    });

    // Wait for the target to finish walking before resolving
    const completeHandler = (event: CustomEvent<{ targetId: string }>) => {
      if (event.detail.targetId === this.event.target) {
        document.removeEventListener(
          "PersonWalkingComplete",
          completeHandler as EventListener
        );
        resolve(null);
      }
    };

    document.addEventListener(
      "PersonWalkingComplete",
      completeHandler as EventListener
    );
  }

  init() {
    return new Promise((resolve) => {
      this[this.event.type](resolve);
    });
  }
}
