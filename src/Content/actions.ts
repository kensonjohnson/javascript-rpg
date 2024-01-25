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
  type: "normal";
  success: { type: "textMessage"; text: string }[];
};

window.Actions = {
  damage1: {
    name: "Whomp!",
    type: "normal",
    success: [
      { type: "textMessage", text: "{CASTER} used Whomp!" },
      //   { type: "animation", animation: "willBeDefinedHere" },
      //   { type: "stateChange", damage: 10 },
    ],
  },
};
