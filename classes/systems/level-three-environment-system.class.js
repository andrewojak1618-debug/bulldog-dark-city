import { LEVEL_THREE } from "../../js/config/level-three-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/** Lädt und erstellt die gestaffelten Umgebungsebenen des dritten Levels. */
export class LevelThreeEnvironmentSystem {
  /**
   * Lädt den Haupthintergrund und alle konfigurierten Parallax-Ebenen.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static load(scene) {
    const background = LEVEL_THREE.background;
    AssetLoaderSystem.loadImage(scene, background);
    this.getParallaxLayers().forEach((layer) => {
      AssetLoaderSystem.loadSpritesheet(scene, layer);
    });
  }

  /**
   * Erstellt die Umgebung in ihrer festgelegten Tiefenreihenfolge.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {object} Referenzen auf Hintergrund und Parallax-Ebenen.
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
   * Gibt die Parallax-Ebenen von hinten nach vorne zurück.
   * @returns {object[]} Konfigurierte Level-3-Umgebungsebenen.
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
   * Erstellt den orangefarbenen Haupthintergrund in Canvas-Höhe.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {Phaser.GameObjects.Image} Erstellter Haupthintergrund.
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
   * Füllt die Welt mit leicht überlappenden, unverzerrten Frames.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {object} layer - Konfiguration der Umgebungsebene.
   * @returns {Phaser.GameObjects.Image[]} Erstellte Ebenensegmente.
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
   * Erstellt ein einzelnes Segment einer konfigurierten Parallax-Ebene.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {object} layer - Konfiguration der Umgebungsebene.
   * @param {number} width - Proportionale Darstellungsbreite.
   * @param {number} step - Horizontaler Abstand zum nächsten Segment.
   * @param {number} index - Laufender Segmentindex.
   * @returns {Phaser.GameObjects.Image} Erstelltes Ebenensegment.
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
