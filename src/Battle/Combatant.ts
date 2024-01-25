import "@styles/Combatant.css";

import type { Battle } from "./Battle";

type CombatantConfig = {
  name: string;
  id?: string;
  team: string;
  src: string;
  icon: string;
  type: "normal" | "spicy" | "veggie" | "fungi" | "chill";
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
  maxXp: number;
  status?: string;
};

export class Combatant {
  battle: Battle;
  hudElement: HTMLDivElement;
  pizzaElement: HTMLImageElement;
  name: string;
  id?: string;
  team: string;
  src: string;
  icon: string;
  type: string;
  level: number;
  hp: number;
  maxHP: number;
  xp: number;
  maxXp: number;
  hpFills?: NodeListOf<SVGRectElement>;
  xpFills?: NodeListOf<SVGRectElement>;

  constructor(config: CombatantConfig, battle: Battle) {
    this.name = config.name;
    this.team = config.team;
    this.battle = battle;
    this.src = config.src;
    this.icon = config.icon;
    this.type = config.type;
    this.level = config.level;
    this.hp = config.hp;
    this.maxHP = config.maxHp;
    this.xp = config.xp;
    this.maxXp = config.maxXp;
    this.hudElement = document.createElement("div");
    this.pizzaElement = document.createElement("img");
  }

  get hpPercent() {
    const percent = (this.hp / this.maxHP) * 100;
    return percent > 0 ? percent : 0;
  }

  get xpPercent() {
    return (this.xp / this.maxXp) * 100;
  }

  get isActive() {
    return this.battle.activeCombatants[this.team] === this.id;
  }

  createElement() {
    this.hudElement.classList.add("Combatant");
    this.hudElement.dataset.team = this.team;
    this.hudElement.dataset.combatant = this.id;
    this.hudElement.innerHTML = /*html*/ `
        <p class="Combatant_name">${this.name}</p>
        <p class="Combatant_level"></p>
        <div>
            <img class="Combatant_character_crop" src="${this.src}" alt="${this.name}">
        </div>
        <img class="Combatant_type" src="${this.icon}" alt="${this.type}">
        <svg class="Combatant_life-container" viewBox="0 0 26 2">
            <rect x="0" y="0" width="0%" height="1" fill="#82ff71" />
            <rect x="0" y="1" width="0%" height="2" fill="#3ef126" />
        </svg>
        <svg class="Combatant_xp-container" viewBox="0 0 26 2">
            <rect x="0" y="0" width="0%" height="1" fill="#ffd76a" />
            <rect x="0" y="1" width="0%" height="1" fill="#ffc934" />
        </svg>
        <p class="Combatant_status"></p>
    `;

    this.pizzaElement.classList.add("Pizza");
    this.pizzaElement.src = this.src;
    this.pizzaElement.alt = this.name;
    this.pizzaElement.dataset.team = this.team;

    this.hpFills = this.hudElement.querySelectorAll(
      ".Combatant_life-container > rect"
    );

    this.xpFills = this.hudElement.querySelectorAll(
      ".Combatant_xp-container > rect"
    );
  }

  update(changes = {}) {
    Object.assign(this, changes);

    // Show the current active combatants
    this.hudElement.dataset.active = this.isActive.toString();
    this.pizzaElement.dataset.active = this.isActive.toString();

    // Update the HUD HP and XP bars
    this.hpFills!.forEach((rect) => (rect.style.width = `${this.hpPercent}%`));
    this.xpFills!.forEach((rect) => (rect.style.width = `${this.xpPercent}%`));

    // Update the HUD level
    this.hudElement.querySelector(".Combatant_level")!.textContent =
      this.level.toString();
  }

  init(container: HTMLElement) {
    this.createElement();
    container.appendChild(this.hudElement);
    container.appendChild(this.pizzaElement);
    this.update();
  }
}
