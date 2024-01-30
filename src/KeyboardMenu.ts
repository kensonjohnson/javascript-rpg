import "@styles/KeyboardMenu.css";
import { KeyPressListener } from "./World/KeyPressListener";

type Option = {
  label: string;
  description: string;
  handler: () => void;
  disabled?: boolean;
  right?: () => string;
};

type KeyboardMenuConfig = {
  decriptionContainer?: HTMLElement;
};

export class KeyboardMenu {
  options: Option[];
  keyPressListeners: KeyPressListener[];
  prevFocus?: HTMLButtonElement;
  element: HTMLDivElement;
  descriptionElement: HTMLDivElement;
  descriptionElementText?: HTMLParagraphElement;
  descriptionContainer?: HTMLElement;

  constructor(config: KeyboardMenuConfig) {
    this.options = [];
    this.keyPressListeners = [];
    this.prevFocus = undefined;
    this.element = document.createElement("div");
    this.descriptionElement = document.createElement("div");
    this.descriptionContainer = config.decriptionContainer;
  }

  setOptions(options: Option[]) {
    this.options = options;
    this.element.innerHTML = this.options
      .map((option, index) => {
        const disabledFlag = option.disabled ? "disabled" : "";
        return /*html*/ `
            <div class='option'>
                <button ${disabledFlag}
                data-button='${index}' data-description='${option.description}'>
                    ${option.label}
                </button>
                <span class="right">${option.right ? option.right() : ""}</span>
            </div>
        `;
      })
      .join("");

    this.element.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const index = parseInt(button.dataset.button!);
        this.options[index].handler();
      });
      button.addEventListener("mouseenter", () => {
        button.focus();
      });
      button.addEventListener("focus", () => {
        this.prevFocus = button;
        this.descriptionElementText!.innerText = button.dataset.description!;
      });
    });

    setTimeout(() => {
      (
        this.element.querySelector(
          "button[data-button]:not([disabled])"
        ) as HTMLButtonElement
      ).focus();
    }, 10);
  }

  createElement() {
    this.element.classList.add("KeyboardMenu");

    this.descriptionElement.classList.add("DescriptionBox");
    this.descriptionElement.innerHTML = /*html*/ `<p>Side desc</p>`;
    this.descriptionElementText = this.descriptionElement.querySelector("p")!;
  }

  end() {
    this.element.remove();
    this.descriptionElement.remove();

    this.keyPressListeners.forEach((listener) => listener.unbind());
  }

  init(container: HTMLElement) {
    this.createElement();
    (this.descriptionContainer ?? container).appendChild(
      this.descriptionElement
    );
    container.appendChild(this.element);

    const up = () => {
      const current = Number(this.prevFocus?.dataset.button);
      const prevButton = (
        Array.from(
          this.element.querySelectorAll("button[data-button]")
        ) as HTMLButtonElement[]
      )
        .reverse()
        .find((button) => {
          return Number(button.dataset.button) < current && !button.disabled;
        });
      prevButton?.focus();
    };

    const down = () => {
      const current = Number(this.prevFocus?.dataset.button);
      const nextButton = (
        Array.from(
          this.element.querySelectorAll("button[data-button]")
        ) as HTMLButtonElement[]
      ).find((button) => {
        return Number(button.dataset.button) > current && !button.disabled;
      });
      nextButton?.focus();
    };

    this.keyPressListeners.push(
      new KeyPressListener("ArrowUp", up),
      new KeyPressListener("ArrowDown", down),
      new KeyPressListener("KeyW", up),
      new KeyPressListener("KeyS", down)
    );
  }
}
