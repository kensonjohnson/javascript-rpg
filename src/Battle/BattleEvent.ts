import { TextMessage } from "@/World/TextMessage";
import type { Battle } from "@/Battle/Battle";
import type { Combatant } from "@/Battle/Combatant";
import { SubmissionMenu } from "@/Battle/SubmissionMenu";
import { Action } from "@/Content/actions";
import { wait } from "@/utils";
import { ReplacementMenu } from "./ReplacementMenu";

type BattleMessageEvent = {
  type: "textMessage";
  text: string;
  caster?: Combatant;
  target?: Combatant;
  action?: Action;
};

type SubmissionMenuEvent = {
  type: "submissionMenu";
  caster: Combatant;
  enemy: Combatant;
};

type StateChangeEvent = {
  type: "stateChange";
  caster: Combatant;
  target: Combatant;
  damage?: number;
  recover?: number;
  status?: {
    type: string;
    expiresIn: number;
  } | null;
  action: Action;
  onCaster?: boolean;
};

type AnimationEvent = {
  type: "animation";
  animation: "spin";
  caster: Combatant;
  target: Combatant;
  color?: string;
};

type ReplaceEvent = {
  type: "replace";
  replacement: Combatant;
};

type ReplacementMenuEvent = {
  type: "replacementMenu";
  team: "player" | "enemy";
};

type GiveXpEvent = {
  type: "giveXp";
  combatant: Combatant;
  xp: number;
};

export type BattleEventType =
  | BattleMessageEvent
  | SubmissionMenuEvent
  | StateChangeEvent
  | AnimationEvent
  | ReplaceEvent
  | ReplacementMenuEvent
  | GiveXpEvent;

export class BattleEvent {
  event: BattleEventType;
  battle: Battle;
  constructor({ event, battle }: { event: BattleEventType; battle: Battle }) {
    this.event = event;
    this.battle = battle;
  }

  textMessage(resolve: (value: void) => void) {
    if (this.event.type !== "textMessage") return;

    const text = this.event.text
      .replace("{CASTER}", this.event.caster?.name as string)
      .replace("{ACTION}", this.event.action?.name as string)
      .replace("{TARGET}", this.event.target?.name as string);

    const message = new TextMessage({
      text: text,
      onComplete: () => {
        resolve();
      },
    });
    message.init(this.battle.element);
  }

  async stateChange(resolve: (value: void) => void) {
    if (this.event.type !== "stateChange") return;
    const { caster, target, damage, recover, status } = this.event;
    let who = this.event.onCaster ? caster : target;
    if (damage) {
      target.update({ hp: target.hp - damage });
      target.pizzaElement.classList.add("battle-damage-blink");
    }

    if (recover) {
      const newHp = who.hp + recover;
      who.update({ hp: newHp > who.maxHP ? who.maxHP : newHp });
    }

    if (status) {
      who.update({ status: { ...status } });
    }

    if (status === null) {
      who.update({ status: undefined });
    }

    await wait(600);

    this.battle.playerTeam?.update();
    this.battle.enemyTeam?.update();

    target.pizzaElement.classList.remove("battle-damage-blink");

    resolve();
  }

  submissionMenu(
    resolve: (value: { action: Action; target: Combatant }) => {
      action: Action;
      target: Combatant;
    }
  ) {
    if (this.event.type !== "submissionMenu") return;
    const { caster } = this.event;
    const menu = new SubmissionMenu({
      caster: this.event.caster,
      enemy: this.event.enemy,
      onComplete: (submission) => {
        resolve(submission);
      },
      items: this.battle.items,
      replacements: Object.values(this.battle.combatants).filter(
        (combatant) => {
          return (
            combatant.id !== caster!.id &&
            combatant.team === caster!.team &&
            combatant.hp > 0
          );
        }
      ),
    });
    menu.init(this.battle.element);
  }

  replacementMenu(resolve: (value: Combatant) => void) {
    if (this.event.type !== "replacementMenu") return;
    const team = this.event.team;
    const menu = new ReplacementMenu({
      onComplete: (replacement) => {
        resolve(replacement);
      },
      replacements: Object.values(this.battle.combatants).filter(
        (combatant) => {
          return combatant.team === team && combatant.hp > 0;
        }
      ),
    });
    menu.init(this.battle.element);
  }

  async replace(resolve: (value: void) => void) {
    if (this.event.type !== "replace") return;
    const { replacement } = this.event;
    if (!replacement || !replacement.team) return;

    const prevCombatant =
      this.battle.combatants[
        this.battle.activeCombatants[replacement.team] as string
      ];
    this.battle.activeCombatants[replacement.team] = undefined;
    prevCombatant.update();
    await wait(400);

    this.battle.activeCombatants[replacement.team] = replacement.id;
    replacement.update();
    await wait(400);

    this.battle.playerTeam?.update();
    this.battle.enemyTeam?.update();

    resolve();
  }

  giveXp(resolve: (value: void) => void) {
    if (this.event.type !== "giveXp") return;
    let amount = this.event.xp;
    const { combatant } = this.event;
    const step = () => {
      if (amount > 0) {
        amount--;
        combatant.xp++;

        // check if we have leveled up
        if (combatant.xp === combatant.maxXp) {
          combatant.xp = 0;
          combatant.level++;
          combatant.maxXp = combatant.level * 100;
        }

        combatant.update();
        requestAnimationFrame(step);
        return;
      }
      resolve();
    };
    requestAnimationFrame(step);
  }

  animation(resolve: (value: void) => void) {
    if (this.event.type !== "animation") return;
    const fn = window.BattleAnimations[this.event.animation];
    fn(this.event, resolve);
  }

  init(
    resolve: (
      value: void | {
        action: Action;
        target: Combatant;
      }
    ) => void | {
      action: Action;
      target: Combatant;
    }
  ) {
    // @ts-ignore
    this[this.event.type](resolve);
  }
}
