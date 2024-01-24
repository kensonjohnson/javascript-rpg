type RevealingTextConfig = {
  element: HTMLElement;
  text: string;
  speed?: number;
};

type RevealingTextCharacter = {
  span: HTMLSpanElement;
  delayAfter: number;
};

export class RevealingText {
  element: HTMLElement;
  text: string;
  speed: number;
  timeout: number | null;
  isDone: boolean;

  constructor(config: RevealingTextConfig) {
    this.element = config.element;
    this.text = config.text;
    this.speed = config.speed ?? 30;

    this.timeout = null;
    this.isDone = false;
  }

  revealOneCharacter(list: RevealingTextCharacter[]) {
    const character = list.shift() as RevealingTextCharacter;
    character.span.classList.add("revealed");

    if (list.length) {
      this.timeout = window.setTimeout(() => {
        this.revealOneCharacter(list);
      }, character.delayAfter); // Assign the return value of setTimeout to a variable of type number
    } else {
      this.isDone = true;
    }
  }

  warpToDone() {
    clearTimeout(this.timeout as number);
    this.isDone = true;
    this.element.querySelectorAll("span").forEach((span) => {
      span.classList.add("revealed");
    });
  }

  init() {
    const characters = this.text.split("").map((character) => {
      // Create each span and add to DOM
      const span = document.createElement("span");
      span.textContent = character;
      this.element.appendChild(span);

      // Add the span to the characters array
      return {
        span,
        delayAfter: character === " " ? 0 : this.speed,
      };
    });

    this.revealOneCharacter(characters);
  }
}
