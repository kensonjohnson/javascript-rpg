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
      {
        find: "@images",
        replacement: fileURLToPath(new URL("./public/images", import.meta.url)),
      },
      {
        find: "@styles",
        replacement: fileURLToPath(new URL("./src/styles", import.meta.url)),
      },
    ],
  },
});
