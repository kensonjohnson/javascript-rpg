// Load content
import "@/Content/pizzas";
import "@/Content/actions";

// Load world
import { Overworld } from "./World/Overworld";

// Launch game on page load
(() => {
  const overworld = new Overworld({
    element: document.querySelector(".game-container") as HTMLElement,
  });
  overworld.init();
})();
