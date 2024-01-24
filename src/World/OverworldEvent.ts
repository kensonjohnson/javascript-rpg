import { TextMessage } from "./TextMessage";
import { getOppositeDirection } from "../utils";
import type { OverworldMap } from "./OverworldMap";
import type { Person } from "./Person";
import { SceneTransition } from "./SceneTransition";

type MovementEvent = {
  target: string;
  type: "walk" | "stand";
  direction: "up" | "down" | "left" | "right";
  time?: number;
};

type TextMessageEvent = {
  type: "textMessage";
  text: string;
  faceHero?: string;
};

type MapChangeEvent = {
  type: "changeMap";
  map: string;
};

export type ValidEvent = MovementEvent | TextMessageEvent | MapChangeEvent;

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

    if (this.event.faceHero) {
      const target = this.map.gameObjects[this.event.faceHero] as Person;
      target.direction = getOppositeDirection(
        this.map.gameObjects["hero"].direction
      );
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve(null),
    });
    message.init(document.querySelector(".game-container") as HTMLElement);
  }

  changeMap(resolve: (value: unknown) => void) {
    const sceneTransition = new SceneTransition();
    sceneTransition.init(
      document.querySelector(".game-container") as HTMLElement,
      () => {
        if (this.event.type !== "changeMap") return;
        this.map.overworld!.startMap(window.OverworldMaps[this.event.map]);
        resolve(null);
        sceneTransition.fadeOut();
      }
    );
  }

  init() {
    return new Promise((resolve) => {
      this[this.event.type](resolve);
    });
  }
}
