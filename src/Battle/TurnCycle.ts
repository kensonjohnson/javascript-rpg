import type { Battle } from "./Battle";

export class TurnCycle {
  battle: Battle;
  onNewEvent: () => Promise<void>;
  currentTeam: "player" | "enemy";
  constructor({ battle, onNewEvent }) {
    this.battle = battle;
    this.onNewEvent = onNewEvent;
    this.currentTeam = "player";
  }

  async turn() {}

  async init() {
    await this.onNewEvent({
      type: "textMessage",
      text: "A wild pizza appeared!",
    });

    // Start the first turn
    this.turn();
  }
}
