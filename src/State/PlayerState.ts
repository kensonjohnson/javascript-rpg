declare global {
  interface Window {
    PlayerState: PlayerState;
  }
}

export interface Pizza {
  pizzaId: string;
  hp: number;
  maxHp: number;
  xp: number;
  maxXp: number;
  level: number;
  status: Status | null;
}

export interface Status {
  type: string;
  expiresIn: number;
}

export class PlayerState {
  pizzas: Record<string, Pizza>;
  lineup: (keyof this["pizzas"])[];
  inventory: { actionId: string; instanceId: string }[];
  constructor() {
    this.pizzas = {
      p1: {
        pizzaId: "s001",
        hp: 30,
        maxHp: 50,
        xp: 95,
        maxXp: 100,
        level: 1,
        status: { type: "saucy", expiresIn: 3 },
      },
      p2: {
        pizzaId: "v001",
        hp: 30,
        maxHp: 50,
        xp: 75,
        maxXp: 100,
        level: 1,
        status: null,
      },
    };
    this.lineup = ["p1", "p2"];
    this.inventory = [
      {
        actionId: "item_recoverHp",
        instanceId: "item1",
      },
      {
        actionId: "item_recoverHp",
        instanceId: "item2",
      },
      {
        actionId: "item_recoverHp",
        instanceId: "item3",
      },
    ];
  }
}

window.PlayerState = new PlayerState();
