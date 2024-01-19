import { Overworld } from "./Overworld";

// Launch game on page load
(() => {
  const overworld = new Overworld({
    element: document.querySelector(".game-container") as HTMLElement,
  });
  overworld.init();
})();
