import { TextMessage } from "@/World/TextMessage";
import type { Battle } from "./Battle";

type BattleMessageEvent = {
  type: "textMessage";
  text: string;
};

export type BattleEventType = BattleMessageEvent;

export class BattleEvent {
  event: { type: "textMessage"; text: string };
  battle: Battle;
  constructor({ event, battle }: { event: any; battle: Battle }) {
    this.event = event;
    this.battle = battle;
  }

  textMessage(resolve: (value: void | PromiseLike<void>) => void) {
    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => {
        resolve();
      },
    });
    message.init(this.battle.element);
  }

  init(resolve: (value: void | PromiseLike<void>) => void) {
    this[this.event.type](resolve);
  }
}
