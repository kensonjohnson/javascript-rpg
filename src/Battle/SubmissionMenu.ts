import "@styles/SubmissionMenu.css";
import { Combatant } from "./Combatant";

export class SubmissionMenu {
  caster: Combatant;
  enemy: Combatant;
  onComplete: (value: any) => any;
  constructor({
    caster,
    enemy,
    onComplete,
  }: {
    caster: Combatant;
    enemy: Combatant;
    onComplete: (value: any) => any;
  }) {
    this.caster = caster;
    this.enemy = enemy;
    this.onComplete = onComplete;
  }

  decide() {
    this.onComplete({
      action: window.Actions[this.caster.actions[0]],
      target: this.enemy,
    });
  }

  // @ts-expect-error
  init(container?: HTMLElement) {
    this.decide();
  }
}
