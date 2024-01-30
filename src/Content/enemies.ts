declare global {
  interface Window {
    Enemies: Enemies;
  }
}
export interface Enemies {
  [key: string]: Enemy;
}
export interface Enemy {
  name: string;
  src: string;
  pizzas: {
    [key: string]: {
      pizzaId: string;
      hp?: number;
      maxHp: number;
      level: number;
    };
  };
}

window.Enemies = {
  erio: {
    name: "Erio",
    src: "images/characters/people/erio.png",
    pizzas: {
      a: {
        pizzaId: "s001",
        maxHp: 50,
        level: 1,
      },
      b: {
        pizzaId: "s002",
        maxHp: 50,
        level: 1,
      },
    },
  },
  beth: {
    name: "Beth",
    src: "images/characters/people/npc1.png",
    pizzas: {
      a: {
        hp: 1,
        pizzaId: "f001",
        maxHp: 50,
        level: 1,
      },
    },
  },
};
