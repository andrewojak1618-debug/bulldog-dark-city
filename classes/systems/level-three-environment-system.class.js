import { LEVEL_THREE } from "../../js/config/level-three-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Manages level three environment system behavior.
 */
export class LevelThreeEnvironmentSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    const background = LEVEL_THREE.background;
    AssetLoaderSystem.loadImage(scene, background);
    this.getParallaxLayers().forEach((layer) => {
      AssetLoaderSystem.loadSpritesheet(scene, layer);
    });
  }

  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {object} The resulting data object.
   */
  static create(scene) {
    return {
      background: this.createMainBackground(scene),
      parallaxLayers: this.getParallaxLayers().map((layer) =>
        this.createParallaxSegments(scene, layer),
      ),
    };
  }

  /**
   * Returns parallax layers.
   * @returns {object[]} The resulting collection.
   */
  static getParallaxLayers() {
    return [
      LEVEL_THREE.skyscrapers,
      LEVEL_THREE.arenaBuildings,
      LEVEL_THREE.tribune,
      LEVEL_THREE.fenceObjects,
      LEVEL_THREE.groundPlatform,
    ];
  }

  /**
   * Creates main background.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Phaser.GameObjects.Image} The resulting data object.
   */
  static createMainBackground(scene) {
    const background = LEVEL_THREE.background;

    return scene.add.image(0, 0, background.key)
      .setOrigin(0)
      .setScrollFactor(background.scrollFactor)
      .setDisplaySize(
        background.displayWidth,
        scene.scale.height,
      )
      .setDepth(background.depth);
  }

  /**
   * Creates parallax segments.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} layer - The layer value.
   * @returns {Phaser.GameObjects.Image[]} The resulting collection.
   */
  static createParallaxSegments(scene, layer) {
    const width = layer.frameWidth *
      (layer.displayHeight / layer.frameHeight);
    const step = width - layer.seamOverlap;
    const count = Math.ceil(
      (LEVEL_THREE.world.width - layer.startX) / step,
    ) + 1;

    return Array.from({ length: count }, (_, index) =>
      this.createParallaxSegment(scene, layer, width, step, index),
    );
  }

  /**
   * Creates parallax segment.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} layer - The layer value.
   * @param {number} width - The width in pixels.
   * @param {number} step - The step value.
   * @param {number} index - The zero-based item index.
   * @returns {Phaser.GameObjects.Image} The resulting data object.
   */
  static createParallaxSegment(scene, layer, width, step, index) {
    const frame = layer.frameSequence[index % layer.frameSequence.length];

    return scene.add.image(
      layer.startX + index * step,
      layer.bottomY,
      layer.key,
      frame,
    )
      .setOrigin(0, 1)
      .setScrollFactor(layer.scrollFactor)
      .setDisplaySize(width, layer.displayHeight)
      .setDepth(layer.depth);
  }
}
