import Phaser from "phaser";
import { HUD } from "../../js/config/hud-settings.js";

/** Stellt nach der Freischaltung den alleinigen Mutationsrahmen dar. */
export class MutationBar extends Phaser.GameObjects.Container {
  /**
   * Erstellt den zunächst außerhalb des Canvas verborgenen Mutationsrahmen.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   */
  constructor(scene) {
    const settings = HUD.mutation;
    super(scene, settings.hiddenX, settings.y);
    scene.add.existing(this);
    const frame = scene.add.image(0, 0, settings.textureKey)
      .setOrigin(0)
      .setDisplaySize(settings.width, settings.height);
    this.add(frame);
    this.setAlpha(0).setScrollFactor(0).setDepth(HUD.depth);
  }

  /**
   * Lässt den Mutationsrahmen nach dem normalen HUD ins Canvas gleiten.
   * @returns {Phaser.Tweens.Tween} Laufender Einblendtween.
   */
  show() {
    const settings = HUD.mutation;
    this.setVisible(true);
    return this.scene.tweens.add({
      targets: this,
      x: settings.x,
      alpha: 1,
      delay: settings.entryDelayMs,
      duration: settings.entryDurationMs,
      ease: "Back.easeOut",
    });
  }
}
