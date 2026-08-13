import Phaser from "phaser";
import { BULLDOG_AUDIO } from "../../js/config/bulldog-audio-settings.js";
import { BULLDOG_ANIMATION_KEYS } from
  "../../js/config/bulldog-animation-settings.js";

/**
 * Manages bulldog audio system behavior.
 */
export class BulldogAudioSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    Object.values(BULLDOG_AUDIO).forEach((audio) => {
      if (scene.cache.audio.exists(audio.key)) return;
      scene.load.audio(audio.key, audio.path);
    });
  }

  /**
   * Creates a new instance.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   */
  constructor(player, scene) {
    this.player = player;
    this.biteSoundPlayed = false;
    this.mutationSound = this.createSound(
      scene,
      BULLDOG_AUDIO.mutationTransform,
    );
    this.biteSound = this.createSound(scene, BULLDOG_AUDIO.biteAttack);
    this.waitSound = this.createSound(scene, BULLDOG_AUDIO.waitBreathe);
    this.bindLifecycleEvents();
  }

  /**
   * Creates sound.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {{key: string, volume: number, loop?: boolean}} settings - The configuration values to use.
   * @returns {Phaser.Sound.BaseSound} The created instance.
   */
  createSound(scene, settings) {
    return scene.sound.add(settings.key, {
      loop: settings.loop ?? false,
      volume: settings.volume,
    });
  }

  /**
   * Binds lifecycle events.
   * @returns {void} No value is returned.
   */
  bindLifecycleEvents() {
    this.player.on(
      Phaser.Animations.Events.ANIMATION_START,
      this.handleAnimationStart,
      this,
    );
    this.player.on(
      Phaser.Animations.Events.ANIMATION_UPDATE,
      this.handleAnimationUpdate,
      this,
    );
    this.player.once(Phaser.GameObjects.Events.DESTROY, this.destroy, this);
  }

  /**
   * Handles prepare bite attack.
   * @returns {void} No value is returned.
   */
  prepareBiteAttack() {
    this.biteSoundPlayed = false;
    this.stopWaitBreathing();
  }

  /**
   * Handles animation start.
   * @param {Phaser.Animations.Animation} animation - The animation configuration to use.
   * @returns {void} No value is returned.
   */
  handleAnimationStart(animation) {
    const isTransformation = [
      BULLDOG_ANIMATION_KEYS.mutationTransform,
      BULLDOG_ANIMATION_KEYS.mutationRevert,
    ].includes(animation.key);
    if (!isTransformation) return;
    this.mutationSound.stop();
    this.mutationSound.play();
  }

  /**
   * Handles animation update.
   * @param {Phaser.Animations.Animation} animation - The animation configuration to use.
   * @param {Phaser.Animations.AnimationFrame} frame - The frame value.
   * @returns {void} No value is returned.
   */
  handleAnimationUpdate(animation, frame) {
    const isBiteFrame = animation.key === BULLDOG_ANIMATION_KEYS.biteAttack &&
      frame.textureFrame === BULLDOG_AUDIO.biteAttack.triggerFrame;
    if (!isBiteFrame || this.biteSoundPlayed) return;
    this.biteSoundPlayed = true;
    this.biteSound.stop();
    this.biteSound.play();
  }

  /**
   * Starts wait breathing.
   * @returns {void} No value is returned.
   */
  startWaitBreathing() {
    if (this.waitSound.isPlaying) return;
    this.waitSound.play();
  }

  /**
   * Stops wait breathing.
   * @returns {void} No value is returned.
   */
  stopWaitBreathing() {
    if (!this.waitSound.isPlaying) return;
    this.waitSound.stop();
  }

  /**
   * Stops all.
   * @returns {void} No value is returned.
   */
  stopAll() {
    this.stopWaitBreathing();
    if (this.mutationSound.isPlaying) this.mutationSound.stop();
    if (this.biteSound.isPlaying) this.biteSound.stop();
  }

  /**
   * Releases the current state.
   * @returns {void} No value is returned.
   */
  destroy() {
    this.player.off(
      Phaser.Animations.Events.ANIMATION_START,
      this.handleAnimationStart,
      this,
    );
    this.player.off(
      Phaser.Animations.Events.ANIMATION_UPDATE,
      this.handleAnimationUpdate,
      this,
    );
    this.mutationSound.destroy();
    this.biteSound.destroy();
    this.waitSound.destroy();
  }
}
