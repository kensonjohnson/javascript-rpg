import "@styles/Menus.css";

import { KeyboardMenu } from "@/KeyboardMenu";
import { KeyPressListener } from "./KeyPressListener";
import { wait } from "@/utils";

export class PauseMenu {
  onComplete: () => void;
  element: HTMLDivElement;
  keyboardMenu: KeyboardMenu;
  esc: KeyPressListener;
  constructor({ onComplete }: { onComplete: () => void }) {
    this.onComplete = onComplete;
    this.element = document.createElement("div");
  }

  getOptions(pageKey: string) {
    if (pageKey === "root") {
      return [
        {
          label: "Save",
          description: "Save the game",
          handler: () => {
            //
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

    return [];
  }

  createElement() {
    this.element.classList.add("PauseMenu");
    this.element.innerHTML = /* html */ `
      <h2>Pause Menu</h2>
    `;
  }

  close() {
    this.esc.unbind();
    this.keyboardMenu.end();
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
