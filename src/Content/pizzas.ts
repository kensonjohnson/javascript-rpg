declare global {
  interface Window {
    PizzaTypes: PizzaTypes;
    Pizzas: Pizzas;
  }
}

export type PizzaTypes = {
  normal: "normal";
  spicy: "spicy";
  veggie: "veggie";
  fungi: "fungi";
  chill: "chill";
};

export type Pizzas = {
  [key: string]: Pizza;
};

type Pizza = {
  name: string;
  description: string;
  type: "normal" | "spicy" | "veggie" | "fungi" | "chill";
  src: string;
  icon: string;
  actions: (keyof typeof window.Actions)[];
};

window.PizzaTypes = {
  normal: "normal",
  spicy: "spicy",
  veggie: "veggie",
  fungi: "fungi",
  chill: "chill",
};

window.Pizzas = {
  s001: {
    name: "Slice Samurai",
    description: "A classic slice for a classic hero.",
    type: window.PizzaTypes.spicy,
    src: import.meta.env.BASE_URL + "images/characters/pizzas/s001.png",
    icon: import.meta.env.BASE_URL + "images/icons/spicy.png",
    actions: ["clumsyStatus", "damage1", "saucyStatus"],
  },
  s002: {
    name: "Bacon Brigade",
    description: "Bacon makes everything better.",
    type: window.PizzaTypes.spicy,
    src: import.meta.env.BASE_URL + "images/characters/pizzas/s002.png",
    icon: import.meta.env.BASE_URL + "images/icons/spicy.png",
    actions: ["clumsyStatus", "damage1", "saucyStatus"],
  },
  v001: {
    name: "Call Me Kale",
    description: "A slice for the health conscious.",
    type: window.PizzaTypes.veggie,
    src: import.meta.env.BASE_URL + "images/characters/pizzas/v001.png",
    icon: import.meta.env.BASE_URL + "images/icons/veggie.png",
    actions: ["damage1"],
  },
  f001: {
    name: "Portobello Express",
    description: "All aboard the mushroom train!",
    type: window.PizzaTypes.fungi,
    src: import.meta.env.BASE_URL + "images/characters/pizzas/f001.png",
    icon: import.meta.env.BASE_URL + "images/icons/fungi.png",
    actions: ["damage1"],
  },
};
