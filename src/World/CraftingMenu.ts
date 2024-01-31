import { KeyboardMenu } from "@/KeyboardMenu";

type CraftingMenuConfig = {
  pizzas: string[];
  onComplete: () => void;
};

export class CraftingMenu {
  pizzas: string[];
  onComplete: () => void;
  element: HTMLDivElement;
  keyboardMenu?: KeyboardMenu;

  constructor({ pizzas, onComplete }: CraftingMenuConfig) {
    this.pizzas = pizzas;
    this.onComplete = onComplete;
    this.element = document.createElement("div");
  }

  getOptions() {
    return this.pizzas.map((id) => {
      const base = window.Pizzas[id];
      return {
        label: base.name,
        description: base.description,
        handler: () => {
          window.PlayerState.addPizza(id);
          this.close();
        },
      };
    });
  }

  createElement() {
    this.element.classList.add("CraftingMenu", "overlayMenu");
    this.element.innerHTML = /* html */ `
      <h2>Create a Pizza</h2>
    `;
  }

  close() {
    this.keyboardMenu?.end();
    this.element.remove();
    this.onComplete();
  }

  init(container: HTMLElement) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      decriptionContainer: container,
    });
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions());

    container.appendChild(this.element);
  }
}
