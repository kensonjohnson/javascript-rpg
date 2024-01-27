import { wait } from "@/utils";
import { BattleEventType } from "./BattleEvent";

declare global {
  interface Window {
    BattleAnimations: BattleAnimations;
  }
}

type BattleAnimationKey = "spin";

export type BattleAnimations = {
  [key in BattleAnimationKey]: BattleAnimation;
};

export type BattleAnimation = (
  event: BattleEventType,
  onComplete: () => void
) => Promise<void>;

window.BattleAnimations = {
  async spin(event: BattleEventType, onComplete: () => void): Promise<void> {
    const element = event.caster!.pizzaElement;
    const animationClassName =
      event.caster!.team === "player"
        ? "battle-spin-right"
        : "battle-spin-left";
    element.classList.add(animationClassName);

    //Remove class when animation is fully complete
    element.addEventListener(
      "animationend",
      () => {
        element.classList.remove(animationClassName);
      },
      { once: true }
    );

    //Continue battle cycle right around when the pizzas collide
    await wait(100);
    onComplete();
  },
};
