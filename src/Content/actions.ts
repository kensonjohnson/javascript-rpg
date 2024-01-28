declare global {
  interface Window {
    Actions: Actions;
  }
}

export type Actions = {
  [key: string]: Action;
};

export type Action = {
  name: string;
  type?: "normal";
  success: {
    type: "textMessage" | "animation" | "stateChange";
    text?: string;
    animation?: string;
    damage?: number;
    recover?: number;
    color?: string;
    status?: null | {
      type: string;
      expiresIn: number;
    };
  }[];
  description: string;
  targetType?: "friendly" | "enemy";
};

window.Actions = {
  damage1: {
    name: "Whomp",
    type: "normal",
    description: "A basic attack",
    success: [
      { type: "textMessage", text: "{CASTER} used {ACTION}!" },
      { type: "animation", animation: "spin" },
      { type: "stateChange", damage: 10 },
    ],
  },
  saucyStatus: {
    name: "Tomato Squeeze",
    targetType: "friendly",
    description: "A heal",
    type: "normal",
    success: [
      { type: "textMessage", text: "{CASTER} used {ACTION}!" },
      { type: "stateChange", status: { type: "saucy", expiresIn: 3 } },
    ],
  },
  clumsyStatus: {
    name: "Olive Oil",
    type: "normal",
    description: "A debuff",
    success: [
      { type: "textMessage", text: "{CASTER} used {ACTION}!" },
      { type: "animation", animation: "glob", color: "green" },
      { type: "stateChange", status: { type: "clumsy", expiresIn: 3 } },
      { type: "textMessage", text: "{TARGET} is slipping all around!" },
    ],
  },
  item_recoverStatus: {
    name: "Heating Lamp",
    description: "Removes status effects",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} used a {ACTION}!" },
      { type: "stateChange", status: null },
      { type: "textMessage", text: "{TARGET} is feeling nice and warm!" },
    ],
  },
  item_recoverHp: {
    name: "Parmesan",
    description: "Heals 10 HP",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} sprinkles on some {ACTION}!" },
      { type: "stateChange", recover: 10 },
      { type: "textMessage", text: "{TARGET} recovered HP!" },
    ],
  },
};
