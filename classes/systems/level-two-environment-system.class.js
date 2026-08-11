import { LEVEL_TWO } from "../../js/config/level-two-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Lädt und erzeugt alle rein visuellen Umgebungsebenen von Level zwei.
 */
export class LevelTwoEnvironmentSystem {
  /**
   * Lädt Hintergrund, Helikopter und Parallax-Spritesheets.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @returns {void}
   */
  static load(scene) {
    AssetLoaderSystem.loadImage(scene, LEVEL_TWO.background);
    this.loadHelicopter(scene);
    this.getParallaxLayers().forEach((layer) => {
      AssetLoaderSystem.loadSpritesheet(scene, layer);
    });
  }

  /**
   * Lädt alle Einzelbilder der Helikopteranimation.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @returns {void}
   */
  static loadHelicopter(scene) {
    LEVEL_TWO.helicopter.frames.forEach((frame) => {
      AssetLoaderSystem.loadImage(scene, frame);
    });
  }

  /**
   * Erzeugt alle Umgebungsebenen in ihrer festgelegten Tiefenreihenfolge.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @returns {object} Referenzen auf Hintergrund, Helikopter und Ebenen.
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
   * Gibt die Parallax-Ebenen in ihrer fachlichen Reihenfolge zurück.
   * @returns {object[]} Konfigurierte Parallax-Ebenen.
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
   * Füllt das Canvas mit dem grünen Level-2-Haupthintergrund.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @returns {Phaser.GameObjects.Image} Erstellter Hintergrund.
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
   * Erstellt den animierten Katzen-Helikopter mit sicherem Fallback.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @returns {Phaser.GameObjects.Sprite|null} Helikopter oder Fallback.
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
   * Filtert nicht geladene Helikopterframes aus dem Fallback-Pfad.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Helikopter-Konfiguration.
   * @returns {object[]} Verfügbare Frame-Konfigurationen.
   */
  static getAvailableHelicopterFrames(scene, settings) {
    return settings.frames.filter((frame) => scene.textures.exists(frame.key));
  }

  /**
   * Registriert die Helikopteranimation genau einmal.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Helikopter-Konfiguration.
   * @param {object[]} frames - Verfügbare Animationsframes.
   * @returns {void}
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
   * Erzeugt und skaliert den Helikopter am rechten Canvasrand.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Helikopter-Konfiguration.
   * @param {object[]} frames - Verfügbare Animationsframes.
   * @returns {Phaser.GameObjects.Sprite} Erstellter Helikopter.
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
   * Berechnet die proportionale Darstellungsbreite des Helikopters.
   * @param {object} settings - Helikopter-Konfiguration.
   * @returns {number} Darstellungsbreite in Pixeln.
   */
  static getHelicopterDisplayWidth(settings) {
    return settings.frameWidth *
      (settings.displayHeight / settings.frameHeight);
  }

  /**
   * Startet Flug- und Schwebe-Tween des Helikopters.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.GameObjects.Sprite} helicopter - Animiertes Flugobjekt.
   * @param {object} settings - Helikopter-Konfiguration.
   * @returns {void}
   */
  static animateHelicopter(scene, helicopter, settings) {
    this.createFlightTween(scene, helicopter, settings);
    this.createHoverTween(scene, helicopter, settings);
  }

  /**
   * Bewegt den Helikopter wiederholt von rechts nach links.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.GameObjects.Sprite} helicopter - Animiertes Flugobjekt.
   * @param {object} settings - Helikopter-Konfiguration.
   * @returns {Phaser.Tweens.Tween} Erstellter Flug-Tween.
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
   * Ergänzt die ruhige vertikale Schwebewegung des Helikopters.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.GameObjects.Sprite} helicopter - Animiertes Flugobjekt.
   * @param {object} settings - Helikopter-Konfiguration.
   * @returns {Phaser.Tweens.Tween} Erstellter Schwebe-Tween.
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
   * Baut eine konfigurierte Ebene aus gleich großen Einzelbildern.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} layer - Zentrale Einstellungen der Ebene.
   * @returns {Phaser.GameObjects.Image[]} Erstellte Bildsegmente.
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
   * Erzeugt ein einzelnes Segment einer Parallax-Ebene.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} layer - Zentrale Einstellungen der Ebene.
   * @param {number} width - Darstellungsbreite eines Segments.
   * @param {number} step - Horizontaler Abstand der Segmente.
   * @param {number} index - Position innerhalb der Ebene.
   * @returns {Phaser.GameObjects.Image} Erstelltes Segment.
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
