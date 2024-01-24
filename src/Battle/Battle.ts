import "@styles/Battle.css";

import HeroImage from "@images/characters/people/hero.png";
import EnemyImage from "@images/characters/people/npc1.png";

class Battle {
  element: HTMLDivElement;
  constructor() {
    this.element = document.createElement("div");
  }

  createElement() {
    this.element.classList.add("Battle");
    this.element.innerHTML = /*html*/ `
        <div class="Battle_hero">
            <img src="${HeroImage}" alt="Hero Sprite">
        </div>
        <div class="Battle_enemy">
            <img src="${EnemyImage}" alt="Enemy Sprite">
        </div>
        `;
  }

  init(container: HTMLElement) {
    this.createElement();
    container.appendChild(this.element);
  }
}
