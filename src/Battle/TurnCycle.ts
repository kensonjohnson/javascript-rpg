import type { Battle } from "@/Battle/Battle";
import type { BattleEventType } from "@/Battle/BattleEvent";

export class TurnCycle {
  battle: Battle;
  onNewEvent: (event: BattleEventType) => Promise<void>;
  currentTeam: "player" | "enemy";
  constructor(
    battle: Battle,
    onNewEvent: (event: BattleEventType) => Promise<void>
  ) {
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
