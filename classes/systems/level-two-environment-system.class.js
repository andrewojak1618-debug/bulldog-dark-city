import { LEVEL_TWO } from "../../js/config/level-two-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Manages level two environment system behavior.
 */
export class LevelTwoEnvironmentSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    AssetLoaderSystem.loadImage(scene, LEVEL_TWO.background);
    this.loadHelicopter(scene);
    this.getParallaxLayers().forEach((layer) => {
      AssetLoaderSystem.loadSpritesheet(scene, layer);
    });
  }

  /**
   * Loads helicopter.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static loadHelicopter(scene) {
    LEVEL_TWO.helicopter.frames.forEach((frame) => {
      AssetLoaderSystem.loadImage(scene, frame);
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
      helicopter: this.createHelicopter(scene),
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
      LEVEL_TWO.skyscrapers,
      LEVEL_TWO.industrialMidground,
      LEVEL_TWO.elevatedRoads,
      LEVEL_TWO.fenceObjects,
      LEVEL_TWO.groundPlatform,
    ];
  }

  /**
   * Creates main background.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Phaser.GameObjects.Image} The resulting data object.
   */
  static createMainBackground(scene) {
    const background = LEVEL_TWO.background;

    return scene.add
      .image(0, 0, background.key)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDisplaySize(scene.scale.width, scene.scale.height)
      .setDepth(background.depth);
  }

  /**
   * Creates helicopter.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Phaser.GameObjects.Sprite|null} The resulting data object.
   */
  static createHelicopter(scene) {
    const settings = LEVEL_TWO.helicopter;
    const frames = this.getAvailableHelicopterFrames(scene, settings);

    if (frames.length === 0) return null;
    this.registerHelicopterAnimation(scene, settings, frames);
    const helicopter = this.createHelicopterSprite(scene, settings, frames);
    this.animateHelicopter(scene, helicopter, settings);
    return helicopter;
  }

  /**
   * Returns available helicopter frames.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @returns {object[]} The resulting collection.
   */
  static getAvailableHelicopterFrames(scene, settings) {
    return settings.frames.filter((frame) => scene.textures.exists(frame.key));
  }

  /**
   * Registers helicopter animation.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @param {object[]} frames - The frames value.
   * @returns {void} No value is returned.
   */
  static registerHelicopterAnimation(scene, settings, frames) {
    if (frames.length < 2 || scene.anims.exists(settings.animationKey)) return;

    scene.anims.create({
      key: settings.animationKey,
      frames: frames.map((frame) => ({ key: frame.key })),
      frameRate: settings.frameRate,
      repeat: -1,
    });
  }

  /**
   * Creates helicopter sprite.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @param {object[]} frames - The frames value.
   * @returns {Phaser.GameObjects.Sprite} The resulting data object.
   */
  static createHelicopterSprite(scene, settings, frames) {
    const width = this.getHelicopterDisplayWidth(settings);
    const helicopter = scene.add
      .sprite(scene.scale.width + width / 2 + settings.edgePadding, settings.y,
        frames[0].key)
      .setScrollFactor(0)
      .setDisplaySize(width, settings.displayHeight)
      .setDepth(settings.depth);

    if (frames.length > 1) helicopter.play(settings.animationKey);
    return helicopter;
  }

  /**
   * Returns helicopter display width.
   * @param {object} settings - The configuration values to use.
   * @returns {number} The resulting numeric value.
   */
  static getHelicopterDisplayWidth(settings) {
    return settings.frameWidth *
      (settings.displayHeight / settings.frameHeight);
  }

  /**
   * Handles animate helicopter.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} helicopter - The helicopter value.
   * @param {object} settings - The configuration values to use.
   * @returns {void} No value is returned.
   */
  static animateHelicopter(scene, helicopter, settings) {
    this.createFlightTween(scene, helicopter, settings);
    this.createHoverTween(scene, helicopter, settings);
  }

  /**
   * Creates flight tween.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} helicopter - The helicopter value.
   * @param {object} settings - The configuration values to use.
   * @returns {Phaser.Tweens.Tween} The created instance.
   */
  static createFlightTween(scene, helicopter, settings) {
    const width = this.getHelicopterDisplayWidth(settings);

    return scene.tweens.add({
      targets: helicopter,
      x: -width / 2 - settings.edgePadding,
      duration: settings.flightDurationMs,
      ease: "Linear",
      repeat: -1,
      repeatDelay: settings.respawnDelayMs,
    });
  }

  /**
   * Creates hover tween.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} helicopter - The helicopter value.
   * @param {object} settings - The configuration values to use.
   * @returns {Phaser.Tweens.Tween} The created instance.
   */
  static createHoverTween(scene, helicopter, settings) {
    return scene.tweens.add({
      targets: helicopter,
      y: settings.y + settings.hoverDistance,
      duration: settings.hoverDurationMs,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
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
      (LEVEL_TWO.world.width - layer.startX) / step,
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

    return scene.add
      .image(layer.startX + index * step, layer.bottomY, layer.key, frame)
      .setOrigin(0, 1)
      .setScrollFactor(layer.scrollFactor, layer.scrollFactorY ?? 0)
      .setDisplaySize(width, layer.displayHeight)
      .setDepth(layer.depth);
  }
}
