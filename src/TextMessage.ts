import "@/styles/TextMessage.css";
import { KeyPressListener } from "./KeyPressListener";

export class TextMessage {
  text: string;
  onComplete: () => void;
  element: HTMLElement | null;
  actionListener?: KeyPressListener;

  constructor({ text, onComplete }: { text: string; onComplete: () => void }) {
    this.text = text;
    this.onComplete = onComplete;
    this.element = null;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("TextMessage");
    this.element.innerHTML = /*html*/ `
      <p class="TextMessage_p">${this.text}</p>
      <button class="TextMessage_button">Next</button>
    `;

    this.element.querySelector("button")?.addEventListener("click", () => {
      // Close the text message
      this.done();
    });

    this.actionListener = new KeyPressListener("Space", () => {
      this.actionListener?.unbind();
      this.done();
    });
  }

  done() {
    this.element?.remove();
    this.onComplete();
  }

  init(container: HTMLElement) {
    this.createElement();
    container.appendChild(this.element as HTMLElement);
  }
}
