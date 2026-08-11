import Phaser from "phaser";
import { BULLDOG_AUDIO } from "../../js/config/bulldog-audio-settings.js";
import { BULLDOG_ANIMATION_KEYS } from
  "../../js/config/bulldog-animation-settings.js";

/**
 * Verwaltet Laden, Wiedergabe und Lebenszyklus der Bulldog-Sounds.
 */
export class BulldogAudioSystem {
  /**
   * Lädt alle Bulldog-Sounds genau einmal in den Phaser-Audiocache.
   * @param {Phaser.Scene} scene - Szene, welche die Sounds verwendet.
   * @returns {void}
   */
  static load(scene) {
    Object.values(BULLDOG_AUDIO).forEach((audio) => {
      if (scene.cache.audio.exists(audio.key)) return;
      scene.load.audio(audio.key, audio.path);
    });
  }

  /**
   * Erstellt die kontrollierten Soundinstanzen für eine Bulldogge.
   * @param {Phaser.Physics.Arcade.Sprite} player - Zugehörige Bulldogge.
   * @param {Phaser.Scene} scene - Aktive Spielszene.
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
   * Erstellt eine Soundinstanz aus den zentralen Konfigurationswerten.
   * @param {Phaser.Scene} scene - Aktive Spielszene.
   * @param {{key: string, volume: number, loop?: boolean}} settings - Soundwerte.
   * @returns {Phaser.Sound.BaseSound} Erstellte Soundinstanz.
   */
  createSound(scene, settings) {
    return scene.sound.add(settings.key, {
      loop: settings.loop ?? false,
      volume: settings.volume,
    });
  }

  /**
   * Bindet Frame- und Aufräumereignisse genau einmal an die Bulldogge.
   * @returns {void}
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
   * Bereitet einen neuen Biss vor und beendet die Atemschleife.
   * @returns {void}
   */
  prepareBiteAttack() {
    this.biteSoundPlayed = false;
    this.stopWaitBreathing();
  }

  /**
   * Startet den Mutationssound synchron mit beiden Transformationen.
   * @param {Phaser.Animations.Animation} animation - Gestartete Animation.
   * @returns {void}
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
   * Spielt den Bisssound genau einmal ab dem konfigurierten Angriffsframe.
   * @param {Phaser.Animations.Animation} animation - Aktuelle Animation.
   * @param {Phaser.Animations.AnimationFrame} frame - Aktueller Frame.
   * @returns {void}
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
   * Startet die Atemschleife genau einmal beim aktiven Wartezustand.
   * @returns {void}
   */
  startWaitBreathing() {
    if (this.waitSound.isPlaying) return;
    this.waitSound.play();
  }

  /**
   * Beendet die Atemschleife unmittelbar bei Bewegung oder einer Aktion.
   * @returns {void}
   */
  stopWaitBreathing() {
    if (!this.waitSound.isPlaying) return;
    this.waitSound.stop();
  }

  /**
   * Stoppt alle aktiven Bulldog-Sounds bei Treffer oder K.-o.
   * @returns {void}
   */
  stopAll() {
    this.stopWaitBreathing();
    if (this.mutationSound.isPlaying) this.mutationSound.stop();
    if (this.biteSound.isPlaying) this.biteSound.stop();
  }

  /**
   * Entfernt Listener und Soundinstanzen beim Zerstören der Bulldogge.
   * @returns {void}
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
