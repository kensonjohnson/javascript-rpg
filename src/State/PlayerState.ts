import { emitEvent } from "@/utils";

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
  storyFlags: Record<string, boolean>;
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
      p3: {
        pizzaId: "f001",
        hp: 50,
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
    this.storyFlags = {};
  }

  addPizza(pizzaId: string) {
    // TODO: Switch to using uuidv4
    const newId = `p${Date.now()}` + Math.floor(Math.random() * 99999);
    this.pizzas[newId] = {
      pizzaId,
      hp: 50,
      maxHp: 50,
      xp: 0,
      maxXp: 100,
      level: 1,
      status: null,
    };
    if (this.lineup.length < 3) {
      this.lineup.push(newId);
    }
    emitEvent("LineupChanged");
    console.log(this);
  }

  swapLineup(oldId: keyof this["pizzas"], incomingId: keyof this["pizzas"]) {
    const oldIndex = this.lineup.indexOf(oldId);
    this.lineup[oldIndex] = incomingId;
    emitEvent("LineupChanged");
  }

  moveToFront(futureFrontId: keyof this["pizzas"]) {
    this.lineup = this.lineup.filter((id) => id !== futureFrontId);
    this.lineup.unshift(futureFrontId);

    emitEvent("LineupChanged");
  }
}

window.PlayerState = new PlayerState();
