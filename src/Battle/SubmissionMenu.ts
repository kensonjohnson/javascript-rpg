import "@styles/SubmissionMenu.css";
import { Combatant } from "./Combatant";
import { KeyboardMenu } from "@/KeyboardMenu";

export class SubmissionMenu {
  caster: Combatant;
  enemy: Combatant;
  keyboardMenu?: KeyboardMenu;
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

  getPages() {
    const backOption = {
      label: "Back",
      description: "Go back to the previous menu",
      handler: () => {
        this.keyboardMenu?.setOptions(this.getPages().root);
      },
    };
    return {
      root: [
        {
          label: "Attack",
          description: "Choose an attack",
          handler: () => {
            this.keyboardMenu?.setOptions(this.getPages().attacks);
          },
        },
        {
          label: "Item",
          description: "Choose an item",
          handler: () => {
            this.keyboardMenu?.setOptions(this.getPages().items);
          },
        },
        {
          label: "Swap",
          description: "Swap to another pizza",
          handler: () => {
            //something
          },
        },
      ],
      attacks: [
        ...this.caster.actions.map((actionName) => {
          const action = window.Actions[actionName];
          return {
            label: action.name,
            description: action.description,
            handler: () => {
              this.menuSubmit(action);
            },
          };
        }),
        backOption,
      ],
      items: [backOption],
    };
  }

  menuSubmit(action: any) {
    this.keyboardMenu?.end();
    this.onComplete({
      action,
      target: action.targetType === "friendly" ? this.caster : this.enemy,
    });
  }

  decide() {
    this.menuSubmit(window.Actions[this.caster.actions[0]]);
  }

  showMenu(container: HTMLElement) {
    this.keyboardMenu = new KeyboardMenu();
    this.keyboardMenu.init(container);
    this.keyboardMenu.setOptions(this.getPages().root);
  }

  init(container: HTMLElement) {
    if (this.caster.isPlayerControlled) {
      this.showMenu(container);
    } else {
      this.decide();
    }
  }
}
