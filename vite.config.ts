import { defineConfig } from "vite";
import { fileURLToPath } from "url";

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/javascript-rpg/" : "/",
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
});
