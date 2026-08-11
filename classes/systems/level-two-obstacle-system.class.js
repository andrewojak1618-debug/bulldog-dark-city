import { LEVEL_TWO } from "../../js/config/level-two-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Lädt und erzeugt die Hindernisse des zweiten Levels.
 */
export class LevelTwoObstacleSystem {
  /**
   * Lädt das Spritesheet der Nuklearbox.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @returns {void}
   */
  static load(scene) {
    this.loadSpritesheet(scene, LEVEL_TWO.nuclearBoxObstacle);
    this.loadSpritesheet(scene, LEVEL_TWO.floatingLightPlatform);
  }

  /**
   * Lädt ein konfiguriertes Hindernis-Spritesheet.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Zentrale Asset-Konfiguration.
   * @returns {void}
   */
  static loadSpritesheet(scene, settings) {
    AssetLoaderSystem.loadSpritesheet(scene, settings);
  }

  /**
   * Erstellt alle konfigurierten Nuklearboxen mit Sprungkollision.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Kollisionsgruppe.
   * @param {number} surfaceY - Vertikale Position der Bodenlaufkante.
   * @returns {Phaser.GameObjects.Sprite[]} Erstellte Nuklearboxen.
   */
  static createNuclearBoxes(scene, platforms, surfaceY) {
    const settings = LEVEL_TWO.nuclearBoxObstacle;

    this.registerAnimation(scene, settings);
    return settings.xPositions.map((x) => {
      const obstacle = this.createSprite(scene, settings, x, surfaceY);
      this.createCollision(scene, platforms, settings, x, surfaceY);
      return obstacle;
    });
  }

  /**
   * Erstellt die jeweils nur von einer Nuklearbox erreichbaren Plattformen.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Kollisionsgruppe.
   * @returns {Phaser.GameObjects.Sprite[]} Erstellte Lichtplattformen.
   */
  static createFloatingLightPlatforms(scene, platforms) {
    const settings = LEVEL_TWO.floatingLightPlatform;

    this.registerAnimation(scene, settings);
    return settings.placements.map((placement) =>
      this.createFloatingLightPlatform(scene, platforms, settings, placement),
    );
  }

  /**
   * Erstellt eine Plattform samt synchroner Kollisionsfläche und Bewegung.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Kollisionsgruppe.
   * @param {object} settings - Zentrale Plattformkonfiguration.
   * @param {object} placement - Position und optionale Bewegung.
   * @returns {Phaser.GameObjects.Sprite} Erstellte Plattformgrafik.
   */
  static createFloatingLightPlatform(scene, platforms, settings, placement) {
    const platform = this.createFloatingPlatformSprite(
      scene,
      settings,
      placement,
    );
    const collision = this.createFloatingPlatformCollision(
      scene,
      platforms,
      settings,
      placement,
    );

    platform.setData("collision", collision);
    this.createFloatingPlatformMotion(scene, platform, collision, settings, placement);
    return platform;
  }

  /**
   * Bewegt Grafik und Kollisionsfläche gemeinsam in einer Endlosschleife.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.GameObjects.Sprite} platform - Sichtbare Plattform.
   * @param {Phaser.GameObjects.Rectangle} collision - Kollisionsfläche.
   * @param {object} settings - Zentrale Plattformkonfiguration.
   * @param {object} placement - Position und optionale Bewegung.
   * @returns {Phaser.Tweens.Tween|null} Plattform-Tween oder null.
   */
  static createFloatingPlatformMotion(
    scene,
    platform,
    collision,
    settings,
    placement,
  ) {
    if (!placement.motion) return null;

    return scene.tweens.add({
      targets: [platform, collision],
      x: this.getFloatingPlatformTargetX(settings, placement.motion),
      duration: placement.motion.durationMs,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
      onUpdate: () => this.syncFloatingPlatformBody(platform, collision),
    });
  }

  /**
   * Synchronisiert Hitbox und Fahrer unmittelbar mit der sichtbaren Plattform.
   * @param {Phaser.GameObjects.Sprite} platform - Sichtbare Plattform.
   * @param {Phaser.GameObjects.Rectangle} collision - Kollisionsfläche.
   * @returns {void}
   */
  static syncFloatingPlatformBody(platform, collision) {
    const previousX = collision.body?.center.x ?? collision.x;

    collision.body?.updateFromGameObject();
    this.carryPlatformRider(platform, collision.x - previousX);
  }

  /**
   * Aktualisiert, auf welcher Lichtplattform die Spielfigur gerade steht.
   * @param {Phaser.Physics.Arcade.Sprite} player - Steuerbare Spielfigur.
   * @param {Phaser.GameObjects.Sprite[]} platforms - Lichtplattformen.
   * @returns {void}
   */
  static updatePlayerPlatformContact(player, platforms = []) {
    const platform = platforms.find((entry) =>
      this.isPlayerStandingOn(player, entry.getData("collision")),
    );

    platforms.forEach((entry) => entry.setData("rider", null));
    platform?.setData("rider", player);
  }

  /**
   * Verschiebt den erkannten Fahrer im selben Schritt wie die Plattform.
   * @param {Phaser.GameObjects.Sprite} platform - Bewegte Lichtplattform.
   * @param {number} deltaX - Aktuelle horizontale Plattformbewegung.
   * @returns {void}
   */
  static carryPlatformRider(platform, deltaX) {
    const player = platform.getData("rider");

    if (!player?.body || player.body.velocity.y < 0 || deltaX === 0) return;
    this.movePlayerHorizontally(player, deltaX);
  }

  /**
   * Prüft den Bodenkontakt und die horizontale Überlappung zur Plattform.
   * @param {Phaser.Physics.Arcade.Sprite} player - Steuerbare Spielfigur.
   * @param {Phaser.GameObjects.Rectangle|undefined} collision - Plattformkante.
   * @returns {boolean} `true`, wenn die Figur auf dieser Plattform steht.
   */
  static isPlayerStandingOn(player, collision) {
    if (!player?.body || !collision?.body) return false;

    const verticallyAligned =
      Math.abs(player.body.bottom - collision.body.top) <= 8;
    const horizontallyAligned =
      player.body.right > collision.body.left &&
      player.body.left < collision.body.right;
    return verticallyAligned && horizontallyAligned && player.body.velocity.y >= 0;
  }

  /**
   * Verschiebt Grafik und dynamische Hitbox der Spielfigur gemeinsam.
   * @param {Phaser.Physics.Arcade.Sprite} player - Steuerbare Spielfigur.
   * @param {number} deltaX - Bewegung der Plattform seit dem letzten Frame.
   * @returns {void}
   */
  static movePlayerHorizontally(player, deltaX) {
    player.x += deltaX;
    player.body.x += deltaX;
  }

  /**
   * Berechnet das Ziel anhand des sichtbaren Abstands zur Zielplattform.
   * @param {object} settings - Zentrale Plattformkonfiguration.
   * @param {object} motion - Bewegungsparameter.
   * @returns {number} Horizontale Zielposition der bewegten Plattform.
   */
  static getFloatingPlatformTargetX(settings, motion) {
    const target = settings.placements[motion.targetPlacementIndex];

    return target.x - settings.displayWidth - motion.edgeGap;
  }

  /**
   * Erzeugt eine Lichtplattform anhand ihrer sichtbaren Oberkante.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Zentrale Plattformkonfiguration.
   * @param {{x: number, visualTopY: number}} placement - Position der Plattform.
   * @returns {Phaser.GameObjects.Sprite} Erstellte Plattformgrafik.
   */
  static createFloatingPlatformSprite(scene, settings, placement) {
    return scene.add
      .sprite(placement.x, placement.visualTopY, settings.key, 0)
      .setOrigin(0.5, 0)
      .setDisplaySize(settings.displayWidth, settings.displayHeight)
      .setDepth(settings.depth)
      .play(settings.animationKey);
  }

  /**
   * Erstellt die Laufkante nach demselben Kollisionsmodell wie in Level 1.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Kollisionsgruppe.
   * @param {object} settings - Zentrale Plattformkonfiguration.
   * @param {{x: number, visualTopY: number}} placement - Position der Plattform.
   * @returns {Phaser.GameObjects.Rectangle} Erstellte Kollisionsfläche.
   */
  static createFloatingPlatformCollision(
    scene,
    platforms,
    settings,
    placement,
  ) {
    const scale = settings.displayWidth / settings.frameWidth;
    const surfaceY =
      placement.visualTopY +
      settings.surfaceOffsetY * scale +
      settings.collisionOffsetY;
    const collisionWidth = settings.displayWidth - settings.edgeInset * 2;
    const collision = scene.add.rectangle(
      placement.x,
      surfaceY + settings.collisionHeight / 2,
      collisionWidth,
      settings.collisionHeight,
    );

    collision.setVisible(false);
    platforms.add(collision);
    return collision;
  }

  /**
   * Registriert eine stabilisierte grüne Pulsanimation genau einmal.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Zentrale Animationskonfiguration.
   * @returns {void}
   */
  static registerAnimation(scene, settings) {
    if (scene.anims.exists(settings.animationKey)) return;

    scene.anims.create({
      key: settings.animationKey,
      frames: settings.animationFrames.map(({ frame, durationMs }) => ({
        key: settings.key,
        frame,
        duration: durationMs,
      })),
      frameRate: settings.frameRate,
      repeat: -1,
    });
  }

  /**
   * Erzeugt eine sichtbare und animierte Hindernisgrafik.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Zentrale Hinderniskonfiguration.
   * @param {number} x - Horizontale Position des Hindernisses.
   * @param {number} bottomY - Vertikale Position der sichtbaren Unterkante.
   * @returns {Phaser.GameObjects.Sprite} Erstellte Hindernisgrafik.
   */
  static createSprite(scene, settings, x, bottomY) {
    return scene.add
      .sprite(x, bottomY, settings.key, 0)
      .setOrigin(0.5, 1)
      .setDisplaySize(settings.displayWidth, settings.displayHeight)
      .setDepth(settings.depth)
      .play(settings.animationKey);
  }

  /**
   * Fügt eine faire, unsichtbare Hitbox zur Plattformgruppe hinzu.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Kollisionsgruppe.
   * @param {object} settings - Zentrale Hinderniskonfiguration.
   * @param {number} x - Horizontale Position der Kollisionsfläche.
   * @param {number} bottomY - Unterkante der Kollisionsfläche.
   * @returns {Phaser.GameObjects.Rectangle} Erstellte Kollisionsfläche.
   */
  static createCollision(scene, platforms, settings, x, bottomY) {
    const collision = scene.add.rectangle(
      x,
      bottomY - settings.collisionHeight / 2,
      settings.collisionWidth,
      settings.collisionHeight,
    );

    collision.setVisible(false);
    platforms.add(collision);
    return collision;
  }
}
