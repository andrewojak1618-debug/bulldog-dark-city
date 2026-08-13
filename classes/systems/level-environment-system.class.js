import { TEST_LEVEL } from "../../js/config/test-level-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Manages level environment system behavior.
 */
export class LevelEnvironmentSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    const assets = TEST_LEVEL.assets;
    scene.load.image(assets.cityBackground.key, assets.cityBackground.path);
    this.getSpritesheetAssets(assets).forEach((asset) =>
      AssetLoaderSystem.loadSpritesheet(scene, asset)
    );
    this.getImageAssets(assets).forEach((asset) =>
      scene.load.image(asset.key, asset.path)
    );
  }

  /**
   * Returns the environment spritesheet assets.
   * @param {object} assets - The level asset settings.
   * @returns {object[]} The spritesheet assets.
   */
  static getSpritesheetAssets(assets) {
    return [assets.skyscraperParallax, assets.midgroundBuildings,
      assets.fenceObjects];
  }

  /**
   * Returns the environment image assets.
   * @param {object} assets - The level asset settings.
   * @returns {object[]} The image assets.
   */
  static getImageAssets(assets) {
    return [assets.cloudParallax, assets.foregroundCloudParallax,
      assets.elevatedRoadParallax, assets.bridgeTrain,
      assets.secondaryBridgeTrain];
  }

  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static create(scene) {
    const { width, height, backgroundColor } = TEST_LEVEL.world;
    scene.add
      .rectangle(width / 2, height / 2, width, height, backgroundColor)
      .setDepth(-20);
    this.createBackgroundLayers(scene);
    this.createAnimatedLayers(scene);
  }

  /**
   * Creates the static and parallax background layers.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static createBackgroundLayers(scene) {
    this.createCityBackground(scene);
    this.createCloudLayer(scene, TEST_LEVEL.assets.cloudParallax, -7);
    this.createSkyscrapers(scene);
    this.createMidgroundBuildings(scene);
    this.createCloudLayer(
      scene,
      TEST_LEVEL.assets.foregroundCloudParallax,
      -3,
    );
    this.createElevatedRoad(scene);
  }

  /**
   * Creates the moving and foreground environment layers.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static createAnimatedLayers(scene) {
    this.createBridgeTrains(scene);
    this.createFenceObjects(scene);
  }

  /**
   * Creates city background.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static createCityBackground(scene) {
    const background = TEST_LEVEL.assets.cityBackground;
    const viewportWidth = scene.scale.width;
    const viewportHeight = scene.scale.height;
    scene.add
      .image(0, 0, background.key)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDisplaySize(viewportWidth, viewportHeight)
      .setDepth(-10);
  }

  /**
   * Creates cloud layer.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {{ key: string, sourceWidth: number, sourceHeight: number, displayHeight: number, offsetX: number, offsetY: number, scrollFactor: number, alpha: number }} clouds - The clouds value.
   * @param {number} depth - The depth value.
   * @returns {void} No value is returned.
   */
  static createCloudLayer(scene, clouds, depth) {
    const displayWidth =
      clouds.sourceWidth *
      (clouds.displayHeight / clouds.sourceHeight);

    scene.add
      .image(clouds.offsetX, clouds.offsetY, clouds.key)
      .setOrigin(0, 0)
      .setScrollFactor(clouds.scrollFactor, 0)
      .setDisplaySize(displayWidth, clouds.displayHeight)
      .setAlpha(clouds.alpha)
      .setDepth(depth);
  }

  /**
   * Creates skyscrapers.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static createSkyscrapers(scene) {
    const skyscrapers = TEST_LEVEL.assets.skyscraperParallax;
    const frameScale =
      skyscrapers.displayHeight / skyscrapers.frameHeight;
    const frameWidth = skyscrapers.frameWidth * frameScale;
    let x = 0;

    skyscrapers.visibleFrames.forEach((frame) => {
      scene.add
        .image(x, scene.scale.height, skyscrapers.key, frame)
        .setOrigin(0, 1)
        .setScrollFactor(skyscrapers.scrollFactor, 0)
        .setDisplaySize(frameWidth, skyscrapers.displayHeight)
        .setDepth(-5);
      x += frameWidth - skyscrapers.seamOverlap;
    });
  }

  /**
   * Creates midground buildings.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static createMidgroundBuildings(scene) {
    const buildings = TEST_LEVEL.assets.midgroundBuildings;
    const displayWidth = this.getFrameDisplayWidth(buildings);
    const segmentStep = displayWidth - buildings.seamOverlap;
    const count = Math.ceil(TEST_LEVEL.world.width / segmentStep) + 1;
    scene.midgroundBuildings = Array.from({ length: count }, (_, index) =>
      this.createBuildingSegment(scene, buildings, displayWidth,
        segmentStep, index)
    );
  }

  /**
   * Creates one midground building segment.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The building settings.
   * @param {number} width - The rendered frame width.
   * @param {number} step - The horizontal segment step.
   * @param {number} index - The segment index.
   * @returns {Phaser.GameObjects.Image} The created segment.
   */
  static createBuildingSegment(scene, settings, width, step, index) {
    const frame = settings.frameSequence[index % settings.frameSequence.length];
    return scene.add.image(index * step, settings.bottomY,
      settings.key, frame)
      .setOrigin(0, 1)
      .setScrollFactor(settings.scrollFactor, 0)
      .setDisplaySize(width, settings.displayHeight)
      .setDepth(settings.depth);
  }

  /**
   * Creates elevated road.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static createElevatedRoad(scene) {
    const road = TEST_LEVEL.assets.elevatedRoadParallax;
    const displayWidth =
      road.sourceWidth * (road.displayHeight / road.sourceHeight);

    scene.add
      .image(0, scene.scale.height + road.offsetY, road.key)
      .setOrigin(0, 1)
      .setScrollFactor(road.scrollFactor, 0)
      .setDisplaySize(displayWidth, road.displayHeight)
      .setDepth(-2);
  }

  /**
   * Creates bridge trains.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static createBridgeTrains(scene) {
    const trains = [
      TEST_LEVEL.assets.bridgeTrain,
      TEST_LEVEL.assets.secondaryBridgeTrain,
    ];

    scene.bridgeTrains = trains.map((settings) => ({
      settings,
      sprite: this.createMovingTrain(scene, settings),
      cooldownMs: 0,
    }));
  }

  /**
   * Creates fence objects.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static createFenceObjects(scene) {
    const fences = TEST_LEVEL.assets.fenceObjects;
    const displayWidth = this.getFrameDisplayWidth(fences);
    const segmentStep = displayWidth - fences.seamOverlap;
    const count = Math.ceil(TEST_LEVEL.world.width / segmentStep) + 1;
    scene.fenceObjects = Array.from({ length: count }, (_, index) =>
      this.createFenceSegment(scene, fences, displayWidth, segmentStep, index)
    );
  }

  /**
   * Returns a frame's rendered width.
   * @param {object} settings - The frame settings.
   * @returns {number} The rendered width.
   */
  static getFrameDisplayWidth(settings) {
    return settings.frameWidth *
      (settings.displayHeight / settings.frameHeight);
  }

  /**
   * Creates one fence segment.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The fence settings.
   * @param {number} width - The rendered frame width.
   * @param {number} step - The horizontal segment step.
   * @param {number} index - The segment index.
   * @returns {Phaser.GameObjects.Image} The created segment.
   */
  static createFenceSegment(scene, settings, width, step, index) {
    const frame = settings.frameSequence[index % settings.frameSequence.length];
    return scene.add.image(index * step, settings.groundY,
      settings.key, frame)
      .setOrigin(0, 1)
      .setDisplaySize(width, settings.displayHeight)
      .setDepth(settings.depth);
  }

  /**
   * Creates moving train.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {{ key: string, sourceWidth: number, sourceHeight: number, displayHeight: number, trackY: number, scrollFactor: number, direction: number, depth: number, startPadding: number }} train - The train value.
   * @returns {Phaser.GameObjects.Image} The resulting data object.
   */
  static createMovingTrain(scene, train) {
    const displayWidth =
      train.sourceWidth * (train.displayHeight / train.sourceHeight);
    const halfWidth = displayWidth / 2;
    const startX = train.direction < 0
      ? scene.scale.width + halfWidth + train.startPadding
      : -halfWidth - train.startPadding;

    return scene.add
      .image(startX, train.trackY, train.key)
      .setOrigin(0.5, 1)
      .setScrollFactor(train.scrollFactor, 0)
      .setDisplaySize(displayWidth, train.displayHeight)
      .setDepth(train.depth);
  }

  /**
   * Updates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  static update(scene, delta) {
    scene.bridgeTrains?.forEach((trainState) =>
      this.updateTrain(scene, trainState, delta)
    );
  }

  /**
   * Updates train.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {{sprite: Phaser.GameObjects.Image, settings: object, cooldownMs: number}} trainState - The train state value.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  static updateTrain(scene, trainState, delta) {
    const { sprite, settings } = trainState;
    const cameraOffset = scene.cameras.main.scrollX * settings.scrollFactor;
    const halfWidth = sprite.displayWidth / 2;
    if (trainState.cooldownMs > 0) {
      this.updateTrainCooldown(
        scene, trainState, delta, cameraOffset, halfWidth,
      );
      return;
    }
    sprite.x += settings.direction * settings.speed * (delta / 1000);
    if (this.hasTrainExited(scene, sprite, settings, cameraOffset, halfWidth)) {
      sprite.setVisible(false);
      trainState.cooldownMs = settings.respawnDelayMs;
    }
  }

  /**
   * Updates train cooldown.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} trainState - The train state value.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @param {number} cameraOffset - The camera offset value.
   * @param {number} halfWidth - The half width value.
   * @returns {void} No value is returned.
   */
  static updateTrainCooldown(
    scene, trainState, delta, cameraOffset, halfWidth,
  ) {
    trainState.cooldownMs -= delta;
    if (trainState.cooldownMs > 0) return;
    this.resetTrainAtEntry(
      scene, trainState.sprite, trainState.settings, cameraOffset, halfWidth,
    );
  }

  /**
   * Checks the train exited condition.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Image} sprite - The sprite value.
   * @param {object} settings - The configuration values to use.
   * @param {number} cameraOffset - The camera offset value.
   * @param {number} halfWidth - The half width value.
   * @returns {boolean} Whether the requested condition is met.
   */
  static hasTrainExited(scene, sprite, settings, cameraOffset, halfWidth) {
    const screenLeft = sprite.x - halfWidth - cameraOffset;
    const screenRight = sprite.x + halfWidth - cameraOffset;
    const exitedLeft = settings.direction < 0 &&
      screenRight < -settings.resetPadding;
    const exitedRight = settings.direction > 0 &&
      screenLeft > scene.scale.width + settings.resetPadding;
    return exitedLeft || exitedRight;
  }

  /**
   * Resets train at entry.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Image} sprite - The sprite value.
   * @param {{direction: number}} settings - The configuration values to use.
   * @param {number} cameraOffset - The camera offset value.
   * @param {number} halfWidth - The half width value.
   * @returns {void} No value is returned.
   */
  static resetTrainAtEntry(
    scene,
    sprite,
    settings,
    cameraOffset,
    halfWidth,
  ) {
    sprite.x = settings.direction < 0
      ? cameraOffset + scene.scale.width + halfWidth
      : cameraOffset - halfWidth;
    sprite.setVisible(true);
  }
}
