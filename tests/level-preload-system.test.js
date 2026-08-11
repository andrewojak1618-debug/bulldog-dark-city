import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LevelPreloadSystem } from
  "../classes/systems/level-preload-system.class.js";

/** Erstellt eine minimale Phaser-ähnliche Szene für den Ladeablauf. */
function createSceneDouble(failedKey = null) {
  const values = new Map();
  let completeHandler;
  let loadErrorHandler;
  return {
    registry: {
      get: (key) => values.get(key),
      set: (key, value) => values.set(key, value),
      remove: (key) => values.delete(key),
    },
    load: {
      startCalls: 0,
      once: (_event, handler) => {
        completeHandler = handler;
      },
      on: (_event, handler) => {
        loadErrorHandler = handler;
      },
      off: () => {
        loadErrorHandler = null;
      },
      start() {
        this.startCalls += 1;
        queueMicrotask(() => {
          if (failedKey) loadErrorHandler?.({ key: failedKey });
          completeHandler();
        });
      },
    },
  };
}

test("Level-Preloader stellt Assets genau einmal in den Loader", async () => {
  const scene = createSceneDouble();
  let queueCalls = 0;
  const options = {
    readyKey: "level-ready",
    promiseKey: "level-promise",
    queue: () => {
      queueCalls += 1;
    },
  };

  assert.equal(await LevelPreloadSystem.preload(scene, options), true);
  assert.equal(await LevelPreloadSystem.preload(scene, options), true);

  assert.equal(queueCalls, 1);
  assert.equal(scene.load.startCalls, 1);
  assert.equal(LevelPreloadSystem.isReady(scene, options.readyKey), true);
});

test("Parallele Preload-Aufrufe verwenden dasselbe Versprechen", async () => {
  const scene = createSceneDouble();
  const options = {
    readyKey: "shared-ready",
    promiseKey: "shared-promise",
    queue: () => {},
  };

  const firstPromise = LevelPreloadSystem.preload(scene, options);
  const secondPromise = LevelPreloadSystem.preload(scene, options);

  assert.equal(firstPromise, secondPromise);
  await firstPromise;
});

test("Level-Preloader meldet fehlgeschlagene Dateien ohne Haenger", async () => {
  const scene = createSceneDouble("missing-level-texture");
  const options = {
    readyKey: "failed-ready",
    promiseKey: "failed-promise",
    queue: () => {},
  };

  assert.equal(await LevelPreloadSystem.preload(scene, options), false);
  assert.equal(LevelPreloadSystem.isReady(scene, options.readyKey), false);
  assert.equal(scene.registry.get(options.promiseKey), undefined);
});

test("Level zwei bereitet Level drei vor und wartet sichtbar auf Restdaten", () => {
  const levelTwoSource = readFileSync(
    new URL(
      "../classes/core/scenes/level-two-scene.class.js",
      import.meta.url,
    ),
    "utf8",
  );
  const levelThreeSource = readFileSync(
    new URL(
      "../classes/core/scenes/level-three-scene.class.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(levelTwoSource, /LevelThreePreloadSystem\.preloadAfterEntry/);
  assert.match(levelTwoSource, /LevelThreePreloadSystem\.enterWhenReady/);
  assert.match(levelThreeSource, /LevelThreePreloadSystem\.completeEntry/);
});
