import { access, cp } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const STATIC_ASSET_DIRECTORIES = Object.freeze(["img", "data", "audio"]);

/**
 * Copies one existing static asset directory.
 * @param {string} directory - The asset directory name.
 * @returns {Promise<void>} Resolves after the copy attempt.
 */
async function copyAssetDirectory(directory) {
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
}

/**
 * Copies static Phaser assets into the distribution directory after a build.
 * @returns {import("vite").Plugin} The static game asset plugin.
 */
function copyStaticAssets() {
  return {
    name: "copy-static-game-assets",
    apply: "build",
    /**
     * Adds the unprocessed asset directories to the production output.
     * @returns {Promise<void>}
     */
    async closeBundle() {
      await Promise.all(STATIC_ASSET_DIRECTORIES.map(copyAssetDirectory));
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
