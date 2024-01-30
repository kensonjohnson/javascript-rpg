import { TextMessage } from "./TextMessage";
import { getOppositeDirection } from "../utils";
import type { OverworldMap } from "./OverworldMap";
import type { Person } from "./Person";
import { SceneTransition } from "./SceneTransition";
import { Battle } from "@/Battle/Battle";

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

type BattleStartEvent = {
  type: "battle";
  enemyId: string;
};

export type OverworldEventType =
  | MovementEvent
  | TextMessageEvent
  | MapChangeEvent
  | BattleStartEvent;

export class OverworldEvent {
  map: OverworldMap;
  event: OverworldEventType;
  constructor({
    map,
    event,
  }: {
    map: OverworldMap;
    event: OverworldEventType;
  }) {
    this.map = map;
    this.event = event;
  }

  stand(resolve: (value: void) => void) {
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
        resolve();
      }
    };

    document.addEventListener(
      "PersonStandComplete",
      completeHandler as EventListener
    );
  }

  walk(resolve: (value: void) => void) {
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
        resolve();
      }
    };

    document.addEventListener(
      "PersonWalkingComplete",
      completeHandler as EventListener
    );
  }

  textMessage(resolve: (value: void) => void) {
    if (this.event.type !== "textMessage") return;

    if (this.event.faceHero) {
      const target = this.map.gameObjects[this.event.faceHero] as Person;
      target.direction = getOppositeDirection(
        this.map.gameObjects["hero"].direction
      );
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve(),
    });
    message.init(document.querySelector(".game-container") as HTMLElement);
  }

  changeMap(resolve: (value: void) => void) {
    const sceneTransition = new SceneTransition();
    sceneTransition.init(
      document.querySelector(".game-container") as HTMLElement,
      () => {
        if (this.event.type !== "changeMap") return;
        this.map.overworld!.startMap(window.OverworldMaps[this.event.map]);
        resolve();
        sceneTransition.fadeOut();
      }
    );
  }

  battle(resolve: (value: void) => void) {
    if (this.event.type !== "battle") return;
    const battle = new Battle({
      enemy: window.Enemies[this.event.enemyId],
      onComplete: () => {
        resolve();
      },
    });
    battle.init(document.querySelector(".game-container") as HTMLElement);
  }

  init() {
    return new Promise((resolve) => {
      this[this.event.type](resolve);
    });
  }
}
