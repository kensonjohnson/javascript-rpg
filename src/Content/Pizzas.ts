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
  type: "normal" | "spicy" | "veggie" | "fungi" | "chill";
  src: string;
  icon: string;
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
    type: window.PizzaTypes.spicy,
    src: "/images/characters/pizzas/s001.png",
    icon: "/images/icons/spicy.png",
  },
  v001: {
    name: "Call Me Kale",
    type: window.PizzaTypes.veggie,
    src: "/images/characters/pizzas/v001.png",
    icon: "/images/icons/veggie.png",
  },
  f001: {
    name: "Portobello Express",
    type: window.PizzaTypes.fungi,
    src: "/images/characters/pizzas/f001.png",
    icon: "/images/icons/fungi.png",
  },
};
