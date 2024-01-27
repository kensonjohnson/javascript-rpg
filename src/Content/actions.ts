declare global {
  interface Window {
    Actions: Actions;
  }
}

type ActionKey = "damage1";

export type Actions = {
  [key in ActionKey]: Action;
};

export type Action = {
  name: string;
  type: "normal";
  success: {
    type: "textMessage" | "animation" | "stateChange";
    text?: string;
    animation?: string;
    damage?: number;
  }[];
};

window.Actions = {
  damage1: {
    name: "Whomp",
    type: "normal",
    success: [
      { type: "textMessage", text: "{CASTER} used {ACTION}!" },
      { type: "animation", animation: "spin" },
      { type: "stateChange", damage: 10 },
    ],
  },
};
