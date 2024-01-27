import { wait } from "@/utils";
import { BattleEventType } from "./BattleEvent";

declare global {
  interface Window {
    BattleAnimations: BattleAnimations;
  }
}

type BattleAnimationKey = "spin" | "glob";

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
  async glob(event: BattleEventType, onComplete: () => void): Promise<void> {
    if (event.type !== "animation") return;
    const { caster } = event;
    const div = document.createElement("div");
    div.classList.add("glob-orb");
    div.classList.add(
      caster?.team === "player" ? "battle-glob-right" : "battle-glob-left"
    );

    div.innerHTML = /*html*/ `
  <svg viewBox="0 0 32 32" width='32' height='32'>
    <circle cx="16" cy="16" r="16" fill="${event.color}" />
  </svg>
    `;

    // Remove the orb when the animation is complete
    div.addEventListener(
      "animationend",
      () => {
        div.remove();
      },
      { once: true }
    );

    // Add the orb to the battle
    document.querySelector(".Battle")?.appendChild(div);

    await wait(820);
    onComplete();
  },
};
