import type { Battle } from "@/Battle/Battle";
import type { BattleEventType } from "@/Battle/BattleEvent";
import { Action } from "@/Content/actions";
import { Combatant } from "./Combatant";

export class TurnCycle {
  battle: Battle;
  onNewEvent: (event: BattleEventType) => Promise<{
    action: Action;
    target: Combatant;
  }>; // TODO: remove any
  currentTeam: "player" | "enemy";

  constructor({
    battle,
    onNewEvent,
  }: {
    battle: Battle;
    onNewEvent: (event: BattleEventType) => Promise<{
      action: Action;
      target: Combatant;
    }>;
  }) {
    this.battle = battle;
    this.onNewEvent = onNewEvent;
    this.currentTeam = "player";
  }

  async turn() {
    // Get the active combatant
    const casterId = this.battle.activeCombatants[this.currentTeam];
    const caster = this.battle.combatants[casterId];
    const enemyId =
      this.battle.activeCombatants[
        caster.team === "player" ? "enemy" : "player"
      ];
    const enemy = this.battle.combatants[enemyId];

    const submission = await this.onNewEvent({
      type: "submissionMenu",
      caster,
      enemy,
    });

    const resultingEvents = caster.getReplacedEvents(submission.action.success);
    for (const resultingEvent of resultingEvents) {
      const event = {
        ...resultingEvent,
        submission,
        action: submission.action,
        caster,
        target: submission.target,
      };
      await this.onNewEvent(event);
    }

    // Check for post event actions
    const postEvents = caster.getPostEvents();
    for (const postEvent of postEvents) {
      const event = {
        ...postEvent,
        submission,
        action: submission.action,
        caster,
        target: submission.target,
      };
      // @ts-expect-error
      await this.onNewEvent(event);
    }

    // Check for status effects expiring
    const expiredEvent = caster.decrementStatus();

    if (expiredEvent) {
      // @ts-expect-error
      await this.onNewEvent(expiredEvent);
    }

    this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
    this.turn();
  }

  async init() {
    await this.onNewEvent({
      type: "textMessage",
      text: "A wild pizza appeared!",
    });

    // Start the first turn
    this.turn();
  }
}
