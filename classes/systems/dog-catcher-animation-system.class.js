import { DOG_CATCHER_ANIMATIONS } from
  "../../js/config/dog-catcher-settings.js";

/**
 * Registriert die Animationen des Hundefängers.
 */
export class DogCatcherAnimationSystem {
  /**
   * Erstellt jede Animation höchstens einmal im globalen Phaser-Manager.
   * @param {Phaser.Scene} scene - Szene mit geladenen Gegnertexturen.
   * @returns {void}
   */
  static register(scene) {
    DOG_CATCHER_ANIMATIONS.forEach((animation) => {
      if (scene.anims.exists(animation.key)) return;
      scene.anims.create({
        key: animation.key,
        frames: this.createFrames(scene, animation),
        frameRate: animation.frameRate,
        repeat: animation.repeat,
      });
    });
  }

  /**
   * Erstellt eine konfigurierte Framefolge oder eine fortlaufende Sequenz.
   * @param {Phaser.Scene} scene - Szene mit globalem Animationsmanager.
   * @param {{textureKey: string, endFrame: number,
   * frameOrder?: ReadonlyArray<number>}} animation - Animationsdaten.
   * @returns {Array<Phaser.Types.Animations.AnimationFrame>} Phaser-Frames.
   */
  static createFrames(scene, animation) {
    if (animation.frameOrder) {
      return animation.frameOrder.map((frame) => ({
        key: animation.textureKey,
        frame,
      }));
    }

    return scene.anims.generateFrameNumbers(animation.textureKey, {
      start: 0,
      end: animation.endFrame,
    });
  }
}
