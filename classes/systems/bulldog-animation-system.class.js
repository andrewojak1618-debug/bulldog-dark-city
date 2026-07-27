import { BULLDOG_ANIMATIONS } from
  "../../js/config/bulldog-animation-settings.js";

/**
 * Registriert die Bewegungsanimationen der normalen Bulldogge.
 */
export class BulldogAnimationSystem {
  /**
   * Erstellt jede Animation genau einmal im globalen Phaser-Manager.
   * @param {Phaser.Scene} scene - Szene mit geladenen Bulldog-Texturen.
   * @returns {void}
   */
  static register(scene) {
    BULLDOG_ANIMATIONS.forEach((animation) => {
      if (scene.anims.exists(animation.key)) {
        return;
      }

      const frames = scene.anims
        .generateFrameNumbers(
          animation.textureKey,
          {
            start: animation.startFrame,
            end: animation.endFrame,
          },
        )
        .map((frame, index) => ({
          ...frame,
          duration: animation.frameDurations?.[index] ?? 0,
        }));

      scene.anims.create({
        key: animation.key,
        frames,
        frameRate: animation.frameRate,
        repeat: animation.repeat,
      });
    });
  }
}
