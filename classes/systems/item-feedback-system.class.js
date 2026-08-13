import { LEVEL_ITEMS } from "../../js/config/level-item-settings.js";

/**
 * Manages item feedback system behavior.
 */
export class ItemFeedbackSystem {
  /**
   * Shows full health.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.Sprite} item - The collectible item instance.
   * @returns {boolean} Whether the requested condition is met.
   */
  static showFullHealth(scene, item) {
    const settings = LEVEL_ITEMS.feedback.healthFull;
    const now = scene.time?.now ?? 0;
    if (!this.canShow(item, now, settings.cooldownMs)) return false;

    item.setData("fullHealthFeedbackAt", now);
    const message = this.createMessage(scene, item, settings);
    this.animateMessage(scene, message, settings);
    return true;
  }

  /**
   * Checks the show condition.
   * @param {Phaser.GameObjects.GameObject} item - The collectible item instance.
   * @param {number} now - The now value.
   * @param {number} cooldownMs - The cooldown ms value.
   * @returns {boolean} Whether the requested condition is met.
   */
  static canShow(item, now, cooldownMs) {
    const lastShownAt = item.getData("fullHealthFeedbackAt");
    if (!Number.isFinite(lastShownAt)) return true;
    return now - lastShownAt >= cooldownMs;
  }

  /**
   * Creates message.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} item - The collectible item instance.
   * @param {object} settings - The configuration values to use.
   * @returns {Phaser.GameObjects.Text} The resulting data object.
   */
  static createMessage(scene, item, settings) {
    return scene.add.text(item.x, item.y - item.displayHeight / 2, settings.text, {
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}px`,
      color: settings.color,
      backgroundColor: settings.backgroundColor,
      padding: { x: settings.paddingX, y: settings.paddingY },
    }).setOrigin(0.5, 1).setDepth(LEVEL_ITEMS.depth + 2);
  }

  /**
   * Handles animate message.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Text} message - The message value.
   * @param {object} settings - The configuration values to use.
   * @returns {Phaser.Tweens.Tween} The resulting value.
   */
  static animateMessage(scene, message, settings) {
    return scene.tweens.add({
      targets: message,
      y: message.y - settings.riseY,
      alpha: 0,
      duration: settings.durationMs,
      ease: "Sine.easeOut",
      onComplete: () => message.destroy(),
    });
  }
}
