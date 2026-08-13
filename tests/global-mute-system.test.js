import assert from "node:assert/strict";
import test from "node:test";
import { GlobalMuteSystem } from
  "../classes/systems/global-mute-system.class.js";

/**
 * Manages storage stub behavior.
 */
class StorageStub {
  /**
   * Creates a new instance.
   */
  constructor(entries = {}) {
    this.entries = new Map(Object.entries(entries));
  }

  /**
   * Returns item.
   * @param {string} key - The lookup key.
   * @returns {string|null} The resulting string value.
   */
  getItem(key) {
    return this.entries.get(key) ?? null;
  }

  /**
   * Sets item.
   * @param {string} key - The lookup key.
   * @param {string} value - The value to process.
   * @returns {void} No value is returned.
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
