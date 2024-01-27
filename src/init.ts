// Load content
import "@/Content/pizzas";
import "@/Content/actions";
import "@/Battle/BattleAnimations";

// Load world
import { Overworld } from "./World/Overworld";

// Launch game on page load
(() => {
  const overworld = new Overworld({
    element: document.querySelector(".game-container") as HTMLElement,
  });
  overworld.init();
})();
