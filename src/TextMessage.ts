import "@/styles/TextMessage.css";
import { KeyPressListener } from "./KeyPressListener";
import { RevealingText } from "./RevealingText";

export class TextMessage {
  text: string;
  onComplete: () => void;
  element: HTMLElement | null;
  actionListener?: KeyPressListener;
  revealingText?: RevealingText;

  constructor({ text, onComplete }: { text: string; onComplete: () => void }) {
    this.text = text;
    this.onComplete = onComplete;
    this.element = null;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("TextMessage");
    this.element.innerHTML = /*html*/ `
      <p class="TextMessage_p"></p>
      <button class="TextMessage_button">Next</button>
    `;

    // Init the typewriter effect
    this.revealingText = new RevealingText({
      element: this.element.querySelector(".TextMessage_p") as HTMLElement,
      text: this.text,
    });

    this.element.querySelector("button")?.addEventListener("click", () => {
      // Close the text message
      this.done();
    });

    this.actionListener = new KeyPressListener("Space", () => {
      this.done();
    });
  }

  done() {
    if (this.revealingText?.isDone) {
      this.element?.remove();
      this.actionListener?.unbind();
      this.onComplete();
    } else {
      this.revealingText?.warpToDone();
    }
  }

  init(container: HTMLElement) {
    this.createElement();
    container.appendChild(this.element as HTMLElement);
    this.revealingText?.init();
  }
}
