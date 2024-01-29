import { KeyboardMenu } from "@/KeyboardMenu";
import type { Combatant } from "./Combatant";

export class ReplacementMenu {
  replacements: Combatant[];
  onComplete: (value: any) => any;
  keyboardMenu?: KeyboardMenu;

  constructor({
    replacements,
    onComplete,
  }: {
    replacements: Combatant[];
    onComplete: (value: any) => any;
  }) {
    this.replacements = replacements;
    this.onComplete = onComplete;
    this.keyboardMenu = new KeyboardMenu();
  }

  decide() {
    this.menuSubmit(this.replacements[0]);
  }

  menuSubmit(replacement: Combatant) {
    this.keyboardMenu?.end();
    this.onComplete(replacement);
  }

  showMenu(container: HTMLElement) {
    if (!this.keyboardMenu) return;
    this.keyboardMenu.init(container);
    this.keyboardMenu.setOptions(
      this.replacements.map((replacement) => {
        return {
          label: replacement.name,
          description: replacement.description,
          handler: () => {
            this.menuSubmit(replacement);
          },
        };
      })
    );
  }

  init(container: HTMLElement) {
    if (this.replacements[0].isPlayerControlled) {
      this.showMenu(container);
    } else {
      this.decide();
    }
  }
}
