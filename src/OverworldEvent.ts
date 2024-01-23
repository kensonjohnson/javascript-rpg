import type { OverworldMap } from "./OverworldMap";
import type { Person } from "./Person";
import { TextMessage } from "./TextMessage";

type MovementEvent = {
  target: string;
  type: "walk" | "stand";
  direction: "up" | "down" | "left" | "right";
  time?: number;
};

type TextMessageEvent = {
  type: "textMessage";
  text: string;
};

export type ValidEvent = MovementEvent | TextMessageEvent;

export class OverworldEvent {
  map: OverworldMap;
  event: ValidEvent;
  constructor({ map, event }: { map: OverworldMap; event: ValidEvent }) {
    this.map = map;
    this.event = event;
  }

  stand(resolve: (value: unknown) => void) {
    if (this.event.type !== "stand") return;
    const target = this.map.gameObjects[this.event.target] as Person;
    target.startBehavior(this.map, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time,
    });

    const completeHandler = (event: CustomEvent<{ targetId: string }>) => {
      // @ts-ignore
      if (event.detail.targetId === this.event.target) {
        document.removeEventListener(
          "PersonStandComplete",
          completeHandler as EventListener
        );
        resolve(null);
      }
    };

    document.addEventListener(
      "PersonStandComplete",
      completeHandler as EventListener
    );
  }

  walk(resolve: (value: unknown) => void) {
    if (this.event.type !== "walk") return;
    const target = this.map.gameObjects[this.event.target] as Person;
    target.startBehavior(this.map, {
      type: "walk",
      direction: this.event.direction,
      retry: true,
    });

    // Wait for the target to finish walking before resolving
    const completeHandler = (event: CustomEvent<{ targetId: string }>) => {
      // @ts-ignore
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

  textMessage(resolve: (value: unknown) => void) {
    if (this.event.type !== "textMessage") return;
    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve(null),
    });
    message.init(document.querySelector(".game-container") as HTMLElement);
  }

  init() {
    return new Promise((resolve) => {
      this[this.event.type](resolve);
    });
  }
}
