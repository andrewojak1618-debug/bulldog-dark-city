import assert from "node:assert/strict";
import test from "node:test";
import {
  DISPLAY_MODES,
  GlobalDisplaySystem,
} from "../classes/systems/global-display-system.class.js";

/** Kleiner LocalStorage-Ersatz für isolierte Anzeigetests. */
class StorageStub {
  /** Erstellt den Speicher mit optionalen Anfangswerten. */
  constructor(entries = {}) {
    this.entries = new Map(Object.entries(entries));
  }

  /** @param {string} key - Speicherschlüssel. @returns {string|null} Wert. */
  getItem(key) {
    return this.entries.get(key) ?? null;
  }

  /** @param {string} key - Schlüssel. @param {string} value - Wert. */
  setItem(key, value) {
    this.entries.set(key, value);
  }
}

test("gespeicherter OLED-Modus wird auf das Canvas übertragen", () => {
  const storage = new StorageStub({
    "bulldog-dark-city.display-mode": DISPLAY_MODES.oled,
  });
  const system = new GlobalDisplaySystem(storage);
  const game = { canvas: { dataset: {} } };

  system.attachGame(game);

  assert.equal(system.getMode(), DISPLAY_MODES.oled);
  assert.equal(game.canvas.dataset.displayMode, DISPLAY_MODES.oled);
});

test("Bildschirmumschalter speichert und meldet den neuen Modus", () => {
  const storage = new StorageStub();
  const system = new GlobalDisplaySystem(storage);
  const states = [];
  system.attachGame({ canvas: { dataset: {} } });
  system.onChange((mode) => states.push(mode));

  assert.equal(system.toggle(), DISPLAY_MODES.oled);
  assert.equal(
    storage.getItem("bulldog-dark-city.display-mode"),
    DISPLAY_MODES.oled,
  );
  assert.deepEqual(states, [DISPLAY_MODES.standard, DISPLAY_MODES.oled]);
});

test("blockierter Speicher fällt sicher auf Standard zurück", () => {
  const blockedStorage = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
  };
  const system = new GlobalDisplaySystem(blockedStorage);

  assert.equal(system.getMode(), DISPLAY_MODES.standard);
  assert.doesNotThrow(() => system.toggle());
});
