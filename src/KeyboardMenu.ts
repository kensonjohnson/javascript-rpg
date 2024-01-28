import "@styles/KeyboardMenu.css";
import { KeyPressListener } from "./World/KeyPressListener";

type Option = {
  label: string;
  description: string;
  handler: () => void;
  disabled?: boolean;
  right?: () => string;
};

export class KeyboardMenu {
  options: Option[];
  up?: KeyPressListener;
  down?: KeyPressListener;
  prevFocus?: HTMLButtonElement;
  element: HTMLDivElement;
  descriptionElement: HTMLDivElement;
  descriptionElementText?: HTMLParagraphElement;
  constructor() {
    this.options = [];
    this.up = undefined;
    this.down = undefined;
    this.prevFocus = undefined;
    this.element = document.createElement("div");
    this.descriptionElement = document.createElement("div");
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

    this.up?.unbind();
    this.down?.unbind();
  }

  init(container: HTMLElement) {
    this.createElement();
    container.appendChild(this.descriptionElement);
    container.appendChild(this.element);

    this.up = new KeyPressListener("ArrowUp", () => {
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
    });

    this.down = new KeyPressListener("ArrowDown", () => {
      const current = Number(this.prevFocus?.dataset.button);
      const nextButton = (
        Array.from(
          this.element.querySelectorAll("button[data-button]")
        ) as HTMLButtonElement[]
      ).find((button) => {
        return Number(button.dataset.button) > current && !button.disabled;
      });
      nextButton?.focus();
    });
  }
}
