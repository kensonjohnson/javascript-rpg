import "@styles/Hud.css";
import { Combatant } from "@/Battle/Combatant";

export class Hud {
  element: HTMLElement;
  scoreboards: Combatant[];

  constructor() {
    this.element = document.createElement("div");
    this.scoreboards = [];
  }

  update() {
    this.scoreboards.forEach((scoreboard) => {
      scoreboard.update(window.PlayerState.pizzas[scoreboard.id!]);
    });
  }

  createElement() {
    if (this.element) {
      this.element.remove();
      this.element = document.createElement("div");
      this.scoreboards = [];
    }

    this.element.classList.add("Hud");

    const { PlayerState } = window;
    PlayerState.lineup.forEach((pizzaId) => {
      const pizza = PlayerState.pizzas[pizzaId];
      const scoreboard = new Combatant(
        {
          id: pizzaId,
          ...window.Pizzas[pizza.pizzaId],
          ...pizza,
        },
        null
      );
      scoreboard.createElement();
      this.scoreboards.push(scoreboard);
      this.element.appendChild(scoreboard.hudElement);
    });
    this.update();
  }

  init(container: HTMLElement) {
    this.createElement();
    container.appendChild(this.element);

    document.addEventListener("PlayerStateUpdated", () => {
      this.update();
    });

    document.addEventListener("LineupChanged", () => {
      this.createElement();
      container.appendChild(this.element);
    });
  }
}
