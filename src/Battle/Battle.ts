import "@styles/Battle.css";

import { Combatant } from "./Combatant";
import { TurnCycle } from "./TurnCycle";
import { BattleEvent } from "./BattleEvent";
import { Team } from "./Team";
import type { Enemy } from "@/Content/enemies";
import type { Status } from "@/State/PlayerState";

type BattleConfig = {
  enemy: Enemy;
  onComplete: () => void;
};

export class Battle {
  enemy: Enemy;
  onComplete: () => void;
  element: HTMLDivElement;
  combatants: Record<string, Combatant>;
  activeCombatants: Record<string, string | undefined>;
  items: {
    actionId: string;
    instanceId: string;
    team: string;
  }[];
  turnCycle?: TurnCycle;
  playerTeam?: Team;
  enemyTeam?: Team;
  usedInstanceIds: Record<string, boolean>;

  constructor(config: BattleConfig) {
    this.enemy = config.enemy;
    this.onComplete = config.onComplete;
    this.element = document.createElement("div");
    this.combatants = {};
    this.activeCombatants = {
      player: undefined,
      enemy: undefined,
    };

    // add combatants from player state
    window.PlayerState.lineup.forEach((pizzaId) => {
      this.addCombatant(
        pizzaId.toString(),
        "player",
        window.PlayerState.pizzas[pizzaId]
      );
    });

    // add combatants from enemy state
    Object.keys(this.enemy.pizzas).forEach((key) => {
      const pizza = this.enemy.pizzas[key];
      this.addCombatant("e_" + key, "enemy", {
        ...pizza,
        pizzaId: pizza.pizzaId,
        maxXp: 100 * pizza.level,
      });
    });

    this.items = [];

    window.PlayerState.inventory.forEach((item) => {
      this.items.push({
        ...item,
        team: "player",
      });
    });

    this.usedInstanceIds = {};
  }

  addCombatant(
    id: string,
    team: "player" | "enemy",
    config: {
      hp?: number;
      maxHp: number;
      xp?: number;
      maxXp: number;
      level: number;
      status?: Status | null;
      pizzaId?: string;
    }
  ) {
    const pizza = window.Pizzas[config.pizzaId as string];
    this.combatants[id] = new Combatant(
      {
        ...pizza,
        ...config,
        team,
        isPlayerControlled: team === "player",
      },
      this
    );

    this.activeCombatants[team] = this.activeCombatants[team] || id;
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
            <img 
            src="${import.meta.env.BASE_URL + this.enemy.src}" 
            alt="${this.enemy.name}"
            >
        </div>
        `;
  }

  init(container: HTMLElement) {
    this.createElement();
    container.appendChild(this.element);

    this.playerTeam = new Team("player", "Hero");
    this.enemyTeam = new Team("enemy", "Bully");

    Object.keys(this.combatants).forEach((key) => {
      const combatant = this.combatants[key];
      combatant.id = key;
      combatant.init(this.element);

      // add to the correct team
      if (combatant.team === "player") {
        this.playerTeam?.combatants.push(combatant);
      } else {
        this.enemyTeam?.combatants.push(combatant);
      }
    });

    this.playerTeam.init(this.element);
    this.enemyTeam.init(this.element);

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
      onWinner: (winner) => {
        if (winner === "player") {
          const playerState = window.PlayerState;
          Object.keys(playerState.pizzas).forEach((id) => {
            const playerStatePizza = playerState.pizzas[id];
            const combatant = this.combatants[id];
            if (combatant) {
              playerStatePizza.hp = combatant.hp;
              playerStatePizza.xp = combatant.xp;
              playerStatePizza.maxXp = combatant.maxXp;
              playerStatePizza.level = combatant.level;
            }
          });

          // remove used items from inventory
          playerState.inventory = playerState.inventory.filter(
            (item) => !this.usedInstanceIds[item.instanceId]
          );
        }
        this.element.remove(); // remove the battle from the DOM
        this.onComplete();
      },
    });
    this.turnCycle.init();
  }
}
