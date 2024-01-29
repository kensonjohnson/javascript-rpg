import type { Battle } from "@/Battle/Battle";
import type { BattleEventType } from "@/Battle/BattleEvent";
import { Action } from "@/Content/actions";
import { Combatant } from "./Combatant";

export class TurnCycle {
  battle: Battle;
  onNewEvent: (event: BattleEventType) => Promise<{
    action: Action;
    target: Combatant;
    instanceId?: string;
    replacement?: Combatant;
    name?: string;
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
    const casterId = this.battle.activeCombatants[this.currentTeam] as string;
    const caster = this.battle.combatants[casterId];
    const enemyId = this.battle.activeCombatants[
      caster.team === "player" ? "enemy" : "player"
    ] as string;
    const enemy = this.battle.combatants[enemyId];

    const submission = await this.onNewEvent({
      type: "submissionMenu",
      caster,
      enemy,
    });

    if (submission.instanceId) {
      this.battle.items = this.battle.items.filter(
        (item) => item.instanceId !== submission.instanceId
      );
    }

    if (submission.replacement) {
      await this.onNewEvent({
        type: "replace",
        replacement: submission.replacement,
      });

      await this.onNewEvent({
        type: "textMessage",
        text: `Go get 'em ${submission.replacement.name}!`,
      });
      this.nextTurn();
      return;
    }

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

    // Check if target is dead
    const targetDead = submission.target.hp <= 0;
    if (targetDead) {
      await this.onNewEvent({
        type: "textMessage",
        text: `${submission.target.name} is ruined!`,
      });
    }

    // Check for winning team
    const winner = this.getWinningTeam();
    if (winner) {
      await this.onNewEvent({
        type: "textMessage",
        text: `${winner} wins!`,
      });

      return;
    }

    // We have a dead target but we don't have a winning team yet
    // bring in a new combatant
    if (targetDead) {
      const replacement = await this.onNewEvent({
        type: "replacementMenu",
        team: submission.target.team,
      });

      await this.onNewEvent({
        type: "replace",
        // @ts-expect-error
        replacement,
      });

      await this.onNewEvent({
        type: "textMessage",
        text: `${replacement.name} appears!`,
      });
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
    this.nextTurn();
  }

  nextTurn() {
    this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
    this.turn();
  }

  getWinningTeam() {
    const aliveTeams: { [key in "player" | "enemy"]?: boolean } = {};
    Object.values(this.battle.combatants).forEach((combatant) => {
      if (combatant.hp > 0) {
        aliveTeams[combatant.team] = true;
      }
    });
    if (!aliveTeams.player) return "enemy";
    if (!aliveTeams.enemy) return "player";
    return null;
  }

  async init() {
    // await this.onNewEvent({
    //   type: "textMessage",
    //   text: "A wild pizza appeared!",
    // });

    // Start the first turn
    this.turn();
  }
}
