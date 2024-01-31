import { KeyboardMenu } from "@/KeyboardMenu";
import { Progress } from "@/State/Progress";
import "@styles/TitleScreen.css";

type TitleScreenConfig = {
  progress: Progress;
};

export class TitleScreen {
  element: HTMLDivElement;
  progress: Progress;
  keyboardMenu?: KeyboardMenu;

  constructor({ progress }: TitleScreenConfig) {
    this.element = document.createElement("div");
    this.progress = progress;
  }

  getOptions(
    resolve: (value?: string | PromiseLike<string> | undefined) => void
  ) {
    const safeFile = this.progress.getSaveFile();
    return [
      {
        label: "New Game",
        description: "Start a new pizza adventure!",
        handler: () => {
          this.close();
          resolve();
        },
      },
      safeFile
        ? {
            label: "Continue Game",
            description: "Continue your adventure",
            handler: () => {
              this.close();
              resolve(safeFile);
            },
          }
        : null,
    ].filter(Boolean);
  }

  createElement() {
    this.element.classList.add("TitleScreen");
    this.element.innerHTML = /*html*/ `
    <img src="${
      import.meta.env.BASE_URL + "images/logo.png"
    }" alt="Pizza Legends"
    class="TitleScreen_logo" />
    >
    `;
  }

  close() {
    this.keyboardMenu?.end();
    this.element.remove();
  }

  async init(container: HTMLElement) {
    return new Promise<any>((resolve) => {
      this.createElement();
      container.appendChild(this.element);
      this.keyboardMenu = new KeyboardMenu({});
      this.keyboardMenu.init(this.element);
      // @ts-expect-error
      this.keyboardMenu.setOptions(this.getOptions(resolve));
    });
  }
}
