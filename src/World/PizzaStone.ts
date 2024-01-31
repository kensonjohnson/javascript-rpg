import { GameObject } from "./GameObject";
import { Sprite } from "./Sprite";

type PizzaStoneConfig = {
  x: number;
  y: number;
  storyFlag: string;
  pizzas: string[];
};

export class PizzaStone extends GameObject {
  storyFlag: string;
  pizzas: string[];
  constructor(config: PizzaStoneConfig) {
    super(config);
    this.sprite = new Sprite({
      gameObject: this,
      src: import.meta.env.BASE_URL + "images/characters/pizza-stone.png",
      animations: {
        "used-down": [[0, 0]],
        "unused-down": [[1, 0]],
      },
      currentAnimation: "used-down",
    });
    this.storyFlag = config.storyFlag;
    this.pizzas = config.pizzas;

    this.talking = [
      {
        required: [this.storyFlag],
        events: [
          {
            type: "textMessage",
            text: "You have already used this.",
          },
        ],
      },
      {
        events: [
          {
            type: "textMessage",
            text: "You have found a pizza stone.",
          },
          {
            type: "craftingMenu",
            pizzas: this.pizzas,
          },
          {
            type: "addStoryFlag",
            flag: this.storyFlag,
          },
        ],
      },
    ];
  }

  update() {
    this.sprite.currentAnimation = window.PlayerState.storyFlags[this.storyFlag]
      ? "used-down"
      : "unused-down";
  }
}
