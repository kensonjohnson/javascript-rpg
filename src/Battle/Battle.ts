import "@styles/Battle.css";

import { Combatant } from "./Combatant";
import { TurnCycle } from "./TurnCycle";
import { BattleEvent } from "./BattleEvent";

type BattleConfig = {
  onComplete: () => void;
};

export class Battle {
  element: HTMLDivElement;
  combatants: Record<string, Combatant>;
  activeCombatants: Record<string, string | undefined>;
  items: {
    actionId: string;
    instanceId: string;
    team: string;
  }[];
  turnCycle?: TurnCycle;
  // @ts-expect-error
  constructor(config: BattleConfig) {
    this.element = document.createElement("div");
    this.combatants = {
      player1: new Combatant(
        {
          ...window.Pizzas.s001,
          team: "player",
          hp: 30,
          maxHp: 50,
          xp: 0,
          maxXp: 100,
          level: 1,
          status: undefined,
          isPlayerControlled: true,
        },
        this
      ),
      player2: new Combatant(
        {
          ...window.Pizzas.s002,
          team: "player",
          hp: 50,
          maxHp: 50,
          xp: 0,
          maxXp: 100,
          level: 1,
          status: undefined,
          isPlayerControlled: true,
        },
        this
      ),
      enemy1: new Combatant(
        {
          ...window.Pizzas.v001,
          team: "enemy",
          hp: 30,
          maxHp: 50,
          xp: 20,
          maxXp: 100,
          level: 1,
          status: undefined,
        },
        this
      ),
      enemy2: new Combatant(
        {
          ...window.Pizzas.f001,
          team: "enemy",
          hp: 45,
          maxHp: 50,
          xp: 30,
          maxXp: 100,
          level: 1,
          status: undefined,
        },
        this
      ),
    };
    this.activeCombatants = {
      player: "player1",
      enemy: "enemy1",
    };
    this.items = [
      {
        actionId: "item_recoverStatus",
        instanceId: "p1",
        team: "player",
      },
      {
        actionId: "item_recoverStatus",
        instanceId: "p2",
        team: "player",
      },
      {
        actionId: "item_recoverStatus",
        instanceId: "p3",
        team: "enemy",
      },
      {
        actionId: "item_recoverHp",
        instanceId: "p4",
        team: "player",
      },
    ];
  }

  createElement() {
    this.element.classList.add("Battle");
    this.element.innerHTML = /*html*/ `
        <div class="Battle_hero">
            <img src="${
              import.meta.env.BASE_URL + "images/characters/people/hero.png"
            }" alt="Hero Sprite">
        </div>
        <div class="Battle_enemy">
            <img src="${
              import.meta.env.BASE_URL + "images/characters/people/npc1.png"
            }" alt="Enemy Sprite">
        </div>
        `;
  }

  init(container: HTMLElement) {
    this.createElement();
    container.appendChild(this.element);

    Object.keys(this.combatants).forEach((key) => {
      const combatant = this.combatants[key];
      combatant.id = key;
      combatant.init(this.element);
    });

    this.turnCycle = new TurnCycle({
      battle: this,
      onNewEvent: (event) => {
        return new Promise((resolve) => {
          const battleEvent = new BattleEvent({
            event,
            battle: this,
          });
          // @ts-ignore
          battleEvent.init(resolve);
        });
      },
    });
    this.turnCycle.init();
  }
}
