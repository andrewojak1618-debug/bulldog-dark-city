import { TEST_LEVEL } from "../../js/config/test-level-settings.js";

/**
 * Lädt, erstellt und aktualisiert die visuelle Umgebung von Level eins.
 */
export class LevelEnvironmentSystem {
  /**
   * Lädt alle Hintergründe, Parallax-Ebenen, Züge und Dekorationen.
   * @param {Phaser.Scene} scene - Aktive Levelszene.
   * @returns {void}
   */
  static load(scene) {
    const assets = TEST_LEVEL.assets;
    scene.load.spritesheet(
      assets.cityBackground.key,
      assets.cityBackground.path,
      {
        frameWidth: assets.cityBackground.frameWidth,
        frameHeight: assets.cityBackground.frameHeight,
      },
    );
    scene.load.spritesheet(
      assets.skyscraperParallax.key,
      assets.skyscraperParallax.path,
      {
        frameWidth: assets.skyscraperParallax.frameWidth,
        frameHeight: assets.skyscraperParallax.frameHeight,
      },
    );
    scene.load.spritesheet(
      assets.fenceObjects.key,
      assets.fenceObjects.path,
      {
        frameWidth: assets.fenceObjects.frameWidth,
        frameHeight: assets.fenceObjects.frameHeight,
      },
    );
    [
      assets.cloudParallax,
      assets.foregroundCloudParallax,
      assets.elevatedRoadParallax,
      assets.bridgeTrain,
      assets.secondaryBridgeTrain,
    ].forEach((asset) => scene.load.image(asset.key, asset.path));
  }

  /**
   * Erstellt die komplette gestaffelte Levelumgebung.
   * @param {Phaser.Scene} scene - Aktive Levelszene.
   * @returns {void}
   */
  static create(scene) {
    const { width, height, backgroundColor } = TEST_LEVEL.world;
    scene.add
      .rectangle(width / 2, height / 2, width, height, backgroundColor)
      .setDepth(-20);
    this.createCityBackground(scene);
    this.createCloudLayer(scene, TEST_LEVEL.assets.cloudParallax, -7);
    this.createSkyscrapers(scene);
    this.createCloudLayer(
      scene,
      TEST_LEVEL.assets.foregroundCloudParallax,
      -3,
    );
    this.createElevatedRoad(scene);
    this.createBridgeTrains(scene);
    this.createFenceObjects(scene);
  }

  /**
   * Füllt das Canvas mit zwei seitenverhältnisgetreuen Stadtvarianten.
   * @param {Phaser.Scene} scene - Aktive Levelszene.
   * @returns {void}
   */
  static createCityBackground(scene) {
    const background = TEST_LEVEL.assets.cityBackground;
    const viewportWidth = scene.scale.width;
    const viewportHeight = scene.scale.height;
    const frameScale = viewportHeight / background.frameHeight;
    const frameWidth = background.frameWidth * frameScale;
    const totalWidth =
      frameWidth * background.visibleFrames.length -
      background.seamOverlap;
    let x = (viewportWidth - totalWidth) / 2;

    background.visibleFrames.forEach((frame) => {
      scene.add
        .image(x, viewportHeight, background.key, frame)
        .setOrigin(0, 1)
        .setScrollFactor(0)
        .setDisplaySize(frameWidth, viewportHeight)
        .setDepth(-10);
      x += frameWidth - background.seamOverlap;
    });
  }

  /**
   * Erstellt eine konfigurierte transparente Wolkenebene.
   * @param {Phaser.Scene} scene - Aktive Levelszene.
   * @param {{
   *   key: string,
   *   sourceWidth: number,
   *   sourceHeight: number,
   *   displayHeight: number,
   *   offsetX: number,
   *   offsetY: number,
   *   scrollFactor: number,
   *   alpha: number
   * }} clouds - Zentrale Wolkenkonfiguration.
   * @param {number} depth - Zeichenebene.
   * @returns {void}
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
   * Erstellt die langsam mitscrollende Hochhaus-Silhouette.
   * @param {Phaser.Scene} scene - Aktive Levelszene.
   * @returns {void}
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
   * Setzt die durchgehende Hochstraße in den nahen Mittelgrund.
   * @param {Phaser.Scene} scene - Aktive Levelszene.
   * @returns {void}
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
   * Erstellt beide Züge mit ihrer gemeinsamen Bewegungslogik.
   * @param {Phaser.Scene} scene - Aktive Levelszene.
   * @returns {void}
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
   * Verbindet die Zaun- und Objektvarianten über die gesamte Levelbreite.
   *
   * Die Motive bleiben reine Dekoration und erhalten deshalb bewusst
   * keinen Physikkörper. Ihre gemeinsame Größe und Bodenhöhe werden
   * ausschließlich über die zentrale Levelkonfiguration gesteuert.
   *
   * @param {Phaser.Scene} scene - Aktive Levelszene.
   * @returns {void}
   */
  static createFenceObjects(scene) {
    const fences = TEST_LEVEL.assets.fenceObjects;
    const displayWidth =
      fences.frameWidth * (fences.displayHeight / fences.frameHeight);
    const segmentStep = displayWidth - fences.seamOverlap;
    const segmentCount =
      Math.ceil(TEST_LEVEL.world.width / segmentStep) + 1;

    scene.fenceObjects = Array.from(
      { length: segmentCount },
      (_, index) => {
        const frame =
          fences.frameSequence[index % fences.frameSequence.length];
        const x = index * segmentStep;

        return scene.add
          .image(x, fences.groundY, fences.key, frame)
          .setOrigin(0, 1)
          .setDisplaySize(displayWidth, fences.displayHeight)
          .setDepth(fences.depth);
      },
    );
  }

  /**
   * Erstellt einen Zug an der Startseite seiner Fahrtrichtung.
   * @param {Phaser.Scene} scene - Aktive Levelszene.
   * @param {{
   *   key: string,
   *   sourceWidth: number,
   *   sourceHeight: number,
   *   displayHeight: number,
   *   trackY: number,
   *   scrollFactor: number,
   *   direction: number,
   *   depth: number,
   *   startPadding: number
   * }} train - Darstellungs- und Bewegungsdaten.
   * @returns {Phaser.GameObjects.Image} Erstelltes Zug-Sprite.
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
   * Aktualisiert Bewegung und Wiederholungspausen beider Züge.
   * @param {Phaser.Scene} scene - Aktive Levelszene.
   * @param {number} delta - Vergangene Zeit seit dem letzten Frame in ms.
   * @returns {void}
   */
  static update(scene, delta) {
    scene.bridgeTrains?.forEach((trainState) => {
      const { sprite, settings } = trainState;
      const cameraOffset =
        scene.cameras.main.scrollX * settings.scrollFactor;
      const halfWidth = sprite.displayWidth / 2;

      if (trainState.cooldownMs > 0) {
        trainState.cooldownMs -= delta;
        if (trainState.cooldownMs <= 0) {
          this.resetTrainAtEntry(
            scene,
            sprite,
            settings,
            cameraOffset,
            halfWidth,
          );
        }
        return;
      }

      sprite.x +=
        settings.direction * settings.speed * (delta / 1000);
      const screenLeft = sprite.x - halfWidth - cameraOffset;
      const screenRight = sprite.x + halfWidth - cameraOffset;
      const exitedLeft =
        settings.direction < 0 &&
        screenRight < -settings.resetPadding;
      const exitedRight =
        settings.direction > 0 &&
        screenLeft > scene.scale.width + settings.resetPadding;

      if (exitedLeft || exitedRight) {
        sprite.setVisible(false);
        trainState.cooldownMs = settings.respawnDelayMs;
      }
    });
  }

  /**
   * Setzt einen Zug nach seiner Pause an den passenden Einfahrtsrand.
   * @param {Phaser.Scene} scene - Aktive Levelszene.
   * @param {Phaser.GameObjects.Image} sprite - Zurückzusetzender Zug.
   * @param {{direction: number}} settings - Fahrtrichtung.
   * @param {number} cameraOffset - Aktueller Parallax-Versatz.
   * @param {number} halfWidth - Halbe Darstellungsbreite.
   * @returns {void}
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
