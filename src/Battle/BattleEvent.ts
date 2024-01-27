import { TextMessage } from "@/World/TextMessage";
import type { Battle } from "@/Battle/Battle";
import type { Combatant } from "@/Battle/Combatant";
import { SubmissionMenu } from "@/Battle/SubmissionMenu";
import { Action } from "@/Content/actions";
import { wait } from "@/utils";

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
};

type AnimationEvent = {
  type: "animation";
  animation: "spin";
  caster: Combatant;
  target: Combatant;
};

export type BattleEventType =
  | BattleMessageEvent
  | SubmissionMenuEvent
  | StateChangeEvent
  | AnimationEvent;

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
    const { target, damage } = this.event;
    if (damage) {
      target.update({ hp: target.hp - damage });
      target.pizzaElement.classList.add("battle-damage-blink");
    }

    await wait(600);

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
    const menu = new SubmissionMenu({
      caster: this.event.caster,
      enemy: this.event.enemy,
      onComplete: (submission) => {
        resolve(submission);
      },
    });
    menu.init(this.battle.element);
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
