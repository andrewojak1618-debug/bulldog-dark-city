import assert from "node:assert/strict";
import test from "node:test";
import { LevelPreloadSystem } from
  "../classes/systems/level-preload-system.class.js";

/** Erstellt eine minimale Phaser-ähnliche Szene für den Ladeablauf. */
function createSceneDouble() {
  const values = new Map();
  let completeHandler;
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
      start() {
        this.startCalls += 1;
        queueMicrotask(() => completeHandler());
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

  await LevelPreloadSystem.preload(scene, options);
  await LevelPreloadSystem.preload(scene, options);

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
