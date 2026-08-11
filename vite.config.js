import { access, cp } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const STATIC_ASSET_DIRECTORIES = Object.freeze(["img", "data", "audio"]);

/**
 * Kopiert statische Phaser-Assets nach dem Vite-Build in den dist-Ordner.
 * Dadurch enthält der FTP-Upload neben dem Bundle auch alle Laufzeitdateien.
 * @returns {import("vite").Plugin} Vite-Plugin für statische Spielassets.
 */
function copyStaticAssets() {
  return {
    name: "copy-static-game-assets",
    apply: "build",

    /**
     * Ergänzt den fertigen Produktionsordner um unverarbeitete Assetordner.
     * @returns {Promise<void>}
     */
    async closeBundle() {
      await Promise.all(
        STATIC_ASSET_DIRECTORIES.map(async (directory) => {
          const source = resolve(directory);

          try {
            await access(source);
          } catch {
            return;
          }

          await cp(source, resolve("dist", directory), {
            recursive: true,
            force: true,
          });
        }),
      );
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [copyStaticAssets()],
  build: {
    rollupOptions: {
      input: {
        game: resolve("index.html"),
        impressum: resolve("impressum.html"),
      },
    },
  },
});
