import "@styles/Menus.css";

import { KeyboardMenu } from "@/KeyboardMenu";
import { KeyPressListener } from "./KeyPressListener";
import { wait } from "@/utils";
import { Progress } from "@/State/Progress";

type PauseMenuConfig = {
  progress: Progress;
  onComplete: () => void;
};

export class PauseMenu {
  progress: Progress;
  onComplete: () => void;
  element: HTMLDivElement;
  keyboardMenu?: KeyboardMenu;
  esc?: KeyPressListener;
  constructor({ progress, onComplete }: PauseMenuConfig) {
    this.progress = progress;
    this.onComplete = onComplete;
    this.element = document.createElement("div");
  }

  getOptions(pageKey: string) {
    // Case 1: Show the root menu
    if (pageKey === "root") {
      const lineupPizzas = window.PlayerState.lineup.map((id) => {
        const pizza = window.PlayerState.pizzas[id];
        const base = window.Pizzas[pizza.pizzaId];
        return {
          label: base.name,
          description: base.description,
          handler: () => {
            this.keyboardMenu?.setOptions(this.getOptions(id));
          },
        };
      });
      return [
        ...lineupPizzas,
        {
          label: "Save",
          description: "Save the game",
          handler: () => {
            this.progress.save();
            this.close();
          },
        },
        {
          label: "Close",
          description: "Close this menu",
          handler: () => {
            this.close();
          },
        },
      ];
    }

    // Case 2: Show a menu for one pizza (by id)
    const unequipped = Object.keys(window.PlayerState.pizzas)
      .filter((id) => {
        return !window.PlayerState.lineup.includes(id);
      })
      .map((id) => {
        const pizza = window.PlayerState.pizzas[id];
        const base = window.Pizzas[pizza.pizzaId];
        return {
          label: `Swap for ${base.name}`,
          description: base.description,
          handler: () => {
            window.PlayerState.swapLineup(pageKey, id);
            this.keyboardMenu?.setOptions(this.getOptions("root"));
          },
        };
      });

    return [
      // Swap for another pizza
      ...unequipped,
      {
        label: "Move to front",
        description: "Move this pizza to the front of the lineup",
        handler: () => {
          window.PlayerState.moveToFront(pageKey);
          this.keyboardMenu?.setOptions(this.getOptions("root"));
        },
      },
      {
        label: "Back",
        description: "Go back to the previous menu",
        handler: () => {
          this.keyboardMenu?.setOptions(this.getOptions("root"));
        },
      },
    ];
  }

  createElement() {
    this.element.classList.add("PauseMenu", "overlayMenu");
    this.element.innerHTML = /* html */ `
      <h2>Pause Menu</h2>
    `;
  }

  close() {
    this.esc?.unbind();
    this.keyboardMenu?.end();
    this.element.remove();
    this.onComplete();
  }

  async init(container: HTMLElement) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      decriptionContainer: container,
    });
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions("root"));

    container.appendChild(this.element);

    wait(200);
    this.esc = new KeyPressListener("Escape", () => {
      this.close();
    });
  }
}
