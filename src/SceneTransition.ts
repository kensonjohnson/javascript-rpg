import "@/styles/SceneTransition.css";

export class SceneTransition {
  element: HTMLDivElement;
  constructor() {
    this.element = document.createElement("div");
    this.element.classList.add("SceneTransition");
  }

  fadeOut() {
    this.element.classList.add("fade-out");
    this.element.addEventListener(
      "animationend",
      () => {
        this.element.remove();
      },
      { once: true }
    );
  }

  init(container: HTMLElement, callback: () => void) {
    container.appendChild(this.element as HTMLDivElement);

    this.element.addEventListener(
      "animationend",
      () => {
        callback();
      },
      { once: true }
    );
  }
}
