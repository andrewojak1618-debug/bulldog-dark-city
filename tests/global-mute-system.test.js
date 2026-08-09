import assert from "node:assert/strict";
import test from "node:test";
import { GlobalMuteSystem } from
  "../classes/systems/global-mute-system.class.js";

/** Erstellt einen kleinen LocalStorage-Ersatz für isolierte Systemtests. */
class StorageStub {
  /** Erstellt den Speicher mit optionalen Anfangswerten. */
  constructor(entries = {}) {
    this.entries = new Map(Object.entries(entries));
  }

  /**
   * Liest einen gespeicherten Wert.
   * @param {string} key - Speicherschlüssel.
   * @returns {string|null} Gespeicherter Wert oder null.
   */
  getItem(key) {
    return this.entries.get(key) ?? null;
  }

  /**
   * Speichert einen Wert wie die native LocalStorage-Schnittstelle.
   * @param {string} key - Speicherschlüssel.
   * @param {string} value - Zu speichernder Wert.
   * @returns {void}
   */
  setItem(key, value) {
    this.entries.set(key, value);
  }
}

test("gespeicherter Mute-Zustand wird beim Start wiederhergestellt", () => {
  const storage = new StorageStub({
    "bulldog-dark-city.audio-muted": "true",
  });
  const system = new GlobalMuteSystem(storage);
  const game = { sound: { mute: false } };

  system.attachGame(game);

  assert.equal(system.isMuted(), true);
  assert.equal(game.sound.mute, true);
});

test("Toggle synchronisiert Phaser, Videos, UI und LocalStorage", () => {
  const storage = new StorageStub();
  const system = new GlobalMuteSystem(storage);
  const game = { sound: { mute: false } };
  const videoStates = [];
  const listenerStates = [];
  const video = { setMute: (muted) => videoStates.push(muted) };

  system.attachGame(game);
  system.registerVideo(video);
  system.onChange((muted) => listenerStates.push(muted));
  const muted = system.toggle();

  assert.equal(muted, true);
  assert.equal(game.sound.mute, true);
  assert.deepEqual(videoStates, [false, true]);
  assert.deepEqual(listenerStates, [false, true]);
  assert.equal(
    storage.getItem("bulldog-dark-city.audio-muted"),
    "true",
  );
});

test("blockierter Browserspeicher verhindert das Umschalten nicht", () => {
  const storage = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
  };
  const system = new GlobalMuteSystem(storage);

  assert.equal(system.isMuted(), false);
  assert.doesNotThrow(() => system.toggle());
  assert.equal(system.isMuted(), true);
});
