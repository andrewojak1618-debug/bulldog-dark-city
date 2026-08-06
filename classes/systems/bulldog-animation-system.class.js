import {
  BULLDOG_ANIMATIONS,
  BULLDOG_TEXTURES,
} from
  "../../js/config/bulldog-animation-settings.js";
import { BulldogAudioSystem } from "./bulldog-audio-system.class.js";

/**
 * Registriert die Bewegungsanimationen der normalen Bulldogge.
 */
export class BulldogAnimationSystem {
  /**
   * Lädt Bulldog-Texturen und delegiert das Laden der zugehörigen Sounds.
   * @param {Phaser.Scene} scene - Szene, welche die Texturen verwendet.
   * @returns {void}
   */
  static load(scene) {
    Object.values(BULLDOG_TEXTURES).forEach((texture) => {
      scene.load.spritesheet(texture.key, texture.path, {
        frameWidth: texture.frameWidth,
        frameHeight: texture.frameHeight,
      });
    });

    BulldogAudioSystem.load(scene);
  }

  /**
   * Erstellt jede Animation genau einmal im globalen Phaser-Manager.
   * @param {Phaser.Scene} scene - Szene mit geladenen Bulldog-Texturen.
   * @returns {void}
   */
  static register(scene) {
    BULLDOG_ANIMATIONS.forEach((animation) =>
      this.registerAnimation(scene, animation)
    );
  }

  /** Registriert eine einzelne Animation, sofern sie noch nicht existiert. */
  static registerAnimation(scene, animation) {
    if (scene.anims.exists(animation.key)) return;
    scene.anims.create({
      key: animation.key,
      frames: this.createFrames(scene, animation),
      frameRate: animation.frameRate,
      repeat: animation.repeat,
    });
  }

  /** Erzeugt die Framefolge mit optionaler Dauer und Rückwärtsrichtung. */
  static createFrames(scene, animation) {
    const frames = scene.anims.generateFrameNumbers(animation.textureKey, {
      start: animation.startFrame,
      end: animation.endFrame,
    }).map((frame, index) => ({
      ...frame,
      duration: animation.frameDurations?.[index] ?? 0,
    }));
    return animation.reverseFrames ? frames.reverse() : frames;
  }
}
