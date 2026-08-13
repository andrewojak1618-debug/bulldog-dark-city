/**
 * Manages ending video system behavior.
 */
export class EndingVideoSystem {
  /**
   * Starts the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static start(scene) {
    try {
      scene.video.play(false);
    } catch {
      scene.showFallback();
    }
  }

  /**
   * Handles size and reveal.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static sizeAndReveal(scene) {
    if (scene.isVideoSized || !scene.video) return;
    const { width, height } = scene.scale;
    scene.isVideoSized = true;
    scene.video.setDisplaySize(width, height).setAlpha(1);
  }
}
