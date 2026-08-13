/**
 * Manages asset loader system behavior.
 */
export class AssetLoaderSystem {
  /**
   * Loads image.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {{key: string, path: string}} asset - The asset value.
   * @returns {boolean} Whether the requested condition is met.
   */
  static loadImage(scene, asset) {
    if (scene.textures.exists(asset.key)) return false;
    scene.load.image(asset.key, asset.path);
    return true;
  }

  /**
   * Loads spritesheet.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {{key: string, path: string, frameWidth: number, frameHeight: number}} asset - The asset value.
   * @returns {boolean} Whether the requested condition is met.
   */
  static loadSpritesheet(scene, asset) {
    if (scene.textures.exists(asset.key)) return false;
    scene.load.spritesheet(asset.key, asset.path, {
      frameWidth: asset.frameWidth,
      frameHeight: asset.frameHeight,
    });
    return true;
  }

  /**
   * Loads audio.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {{key: string, path: string|string[]}} asset - The asset value.
   * @returns {boolean} Whether the requested condition is met.
   */
  static loadAudio(scene, asset) {
    if (scene.cache.audio.exists(asset.key)) return false;
    scene.load.audio(asset.key, asset.path);
    return true;
  }
}
