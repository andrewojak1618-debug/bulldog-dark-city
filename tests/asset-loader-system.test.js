import assert from "node:assert/strict";
import test from "node:test";
import { AssetLoaderSystem } from
  "../classes/systems/asset-loader-system.class.js";
import { LevelItemSystem } from
  "../classes/systems/level-item-system.class.js";

/** Erstellt Cache- und Loader-Doubles fuer die Asset-Hilfen. */
function createSceneDouble() {
  const textureKeys = new Set(["cached-texture"]);
  const audioKeys = new Set(["cached-audio"]);
  const calls = [];

  return {
    calls,
    textures: { exists: (key) => textureKeys.has(key) },
    cache: { audio: { exists: (key) => audioKeys.has(key) } },
    load: {
      image: (key) => calls.push(["image", key]),
      spritesheet: (key) => calls.push(["spritesheet", key]),
      audio: (key) => calls.push(["audio", key]),
    },
  };
}

test("Asset-Loader reiht vorhandene Cache-Eintraege nicht erneut ein", () => {
  const scene = createSceneDouble();

  assert.equal(AssetLoaderSystem.loadImage(scene, {
    key: "cached-texture",
    path: "cached.png",
  }), false);
  assert.equal(AssetLoaderSystem.loadSpritesheet(scene, {
    key: "cached-texture",
    path: "cached-sheet.png",
    frameWidth: 64,
    frameHeight: 64,
  }), false);
  assert.equal(AssetLoaderSystem.loadAudio(scene, {
    key: "cached-audio",
    path: "cached.ogg",
  }), false);
  assert.deepEqual(scene.calls, []);
});

test("Asset-Loader reiht neue Texturen und Sounds genau einmal ein", () => {
  const scene = createSceneDouble();

  AssetLoaderSystem.loadImage(scene, { key: "image", path: "image.png" });
  AssetLoaderSystem.loadSpritesheet(scene, {
    key: "sheet",
    path: "sheet.png",
    frameWidth: 64,
    frameHeight: 64,
  });
  AssetLoaderSystem.loadAudio(scene, {
    key: "sound",
    path: ["sound.mp3", "sound.ogg"],
  });

  assert.deepEqual(scene.calls, [
    ["image", "image"],
    ["spritesheet", "sheet"],
    ["audio", "sound"],
  ]);
});

test("Item-Sound faellt bei fehlendem Mobilformat sicher aus", () => {
  let playCalls = 0;
  const scene = {
    cache: { audio: { exists: () => false } },
    sound: { play: () => { playCalls += 1; } },
  };

  assert.equal(LevelItemSystem.playPickupSound(scene, {
    soundKey: "missing-health-sound",
  }), false);
  assert.equal(playCalls, 0);
});
