import { TEST_LEVEL } from "../../js/config/test-level-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Manages level one platform system behavior.
 */
export class LevelOnePlatformSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    const ground = TEST_LEVEL.assets.groundPlatform;
    const floating = TEST_LEVEL.assets.floatingPlatform;
    AssetLoaderSystem.loadSpritesheet(scene, ground);
    AssetLoaderSystem.loadSpritesheet(scene, floating);
  }

  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Phaser.Physics.Arcade.StaticGroup} The created instance.
   */
  static create(scene) {
    const platforms = scene.physics.add.staticGroup();
    TEST_LEVEL.platforms.forEach((config, index) => {
      this.createPlatform(scene, platforms, config, index === 0);
    });
    return platforms;
  }

  /**
   * Creates platform.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The platforms value.
   * @param {object} config - The configuration values to use.
   * @param {boolean} isGround - The is ground value.
   * @returns {void} No value is returned.
   */
  static createPlatform(scene, platforms, config, isGround) {
    const hasVisual = Number.isInteger(config.visualFrame);
    const edgeInset = isGround ? 0 : TEST_LEVEL.platformCollision.edgeInset;
    this.getCollisionAreas(config, edgeInset).forEach((area) => {
      this.createCollision(scene, platforms, area, isGround, hasVisual);
    });
    if (isGround) this.createGroundVisual(scene, config);
    if (!isGround && hasVisual) this.createRaisedVisual(scene, config);
  }

  /**
   * Creates collision.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The platforms value.
   * @param {{x: number, y: number, width: number, height: number}} area - The area value.
   * @param {boolean} isGround - The is ground value.
   * @param {boolean} hasVisual - The has visual value.
   * @returns {void} No value is returned.
   */
  static createCollision(scene, platforms, area, isGround, hasVisual) {
    const debug = TEST_LEVEL.platformDebug;
    const collision = scene.add.rectangle(
      area.x,
      area.y,
      area.width,
      area.height,
      isGround ? debug.groundFillColor : debug.raisedFillColor,
    );
    const strokeColor = isGround ?
      debug.groundStrokeColor : debug.raisedStrokeColor;
    collision.setStrokeStyle(debug.strokeWidth, strokeColor, debug.strokeAlpha);
    collision.setVisible(!isGround && !hasVisual);
    platforms.add(collision);
  }

  /**
   * Returns collision areas.
   * @param {object} config - The configuration values to use.
   * @param {number} edgeInset - The edge inset value.
   * @returns {Array<{x: number, y: number, width: number, height: number}>} The resulting numeric value.
   */
  static getCollisionAreas(config, edgeInset = 0) {
    if (!config.stepDown) {
      return [{ ...config, width: config.width - edgeInset * 2 }];
    }
    return this.getSteppedCollisionAreas(config, edgeInset);
  }

  /**
   * Returns stepped collision areas.
   * @param {object} config - The configuration values to use.
   * @param {number} edgeInset - The edge inset value.
   * @returns {Array<{x: number, y: number, width: number, height: number}>} The resulting numeric value.
   */
  static getSteppedCollisionAreas(config, edgeInset) {
    const { splitRatio, splitOffsetX = 0, dropY } = config.stepDown;
    const leftEdge = config.x - config.width / 2;
    const leftWidth = config.width * splitRatio + splitOffsetX;
    const rightWidth = config.width - leftWidth;
    const areas = [
      this.createArea(leftEdge, leftWidth, config.y, config.height),
      this.createArea(
        leftEdge + leftWidth,
        rightWidth,
        config.y + dropY,
        config.height,
      ),
    ];
    return this.insetOuterEdges(areas, edgeInset);
  }

  /**
   * Creates area.
   * @param {number} left - The left value.
   * @param {number} width - The width in pixels.
   * @param {number} y - The vertical position.
   * @param {number} height - The height in pixels.
   * @returns {{x: number, y: number, width: number, height: number}} The resulting numeric value.
   */
  static createArea(left, width, y, height) {
    return { x: left + width / 2, y, width, height };
  }

  /**
   * Handles inset outer edges.
   * @param {Array<{x: number, y: number, width: number, height: number}>} areas - The areas value.
   * @param {number} edgeInset - The edge inset value.
   * @returns {Array<{x: number, y: number, width: number, height: number}>} The resulting numeric value.
   */
  static insetOuterEdges(areas, edgeInset) {
    return areas.map((area, index) => {
      const leftInset = index === 0 ? edgeInset : 0;
      const rightInset = index === areas.length - 1 ? edgeInset : 0;
      return {
        ...area,
        x: area.x + (leftInset - rightInset) / 2,
        width: area.width - leftInset - rightInset,
      };
    });
  }

  /**
   * Creates ground visual.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} config - The configuration values to use.
   * @returns {void} No value is returned.
   */
  static createGroundVisual(scene, config) {
    const ground = TEST_LEVEL.assets.groundPlatform;
    const platformTop = config.y - config.height / 2;
    const visualTop = platformTop - ground.surfaceOffsetY -
      ground.characterLaneOffsetY;
    const step = ground.frameWidth - ground.seamOverlap;
    const segmentCount = Math.ceil((config.width + ground.seamOverlap) / step);
    const startX = config.x - config.width / 2 - ground.seamOverlap;
    Array.from({ length: segmentCount }, (_, index) => {
      this.createGroundSegment(scene, ground, startX + index * step, visualTop);
    });
  }

  /**
   * Creates ground segment.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} ground - The ground value.
   * @param {number} x - The horizontal position.
   * @param {number} y - The vertical position.
   * @returns {Phaser.GameObjects.Image} The resulting data object.
   */
  static createGroundSegment(scene, ground, x, y) {
    return scene.add.image(x, y, ground.key, ground.frame).setOrigin(0, 0);
  }

  /**
   * Creates raised visual.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} config - The configuration values to use.
   * @returns {void} No value is returned.
   */
  static createRaisedVisual(scene, config) {
    const floating = TEST_LEVEL.assets.floatingPlatform;
    const scale = config.width / floating.frameWidth;
    const platformTop = config.y - config.height / 2;
    const visualTop = platformTop - floating.surfaceOffsetY * scale;
    scene.add.image(config.x, visualTop, floating.key, config.visualFrame)
      .setOrigin(0.5, 0)
      .setDisplaySize(config.width, floating.frameHeight * scale);
  }
}
