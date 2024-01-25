import type { Battle } from "./Battle";

export class BattleEvent {
  event: { type: "textMessage" };
  battle: Battle;
  constructor({ event, battle }) {
    this.event = event;
    this.battle = battle;
  }

  testMessage(resolve: (value: unknown) => void) {
    console.log("testMessage works");
  }

  init(resolve: (value: unknown) => void) {
    this[this.event.type](resolve);
  }
}
