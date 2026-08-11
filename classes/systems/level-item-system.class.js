import { LEVEL_ITEMS } from "../../js/config/level-item-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Lädt und erzeugt die animierten Sammelobjekte des Testlevels.
 */
export class LevelItemSystem {
  /**
   * Lädt alle konfigurierten Item-Spritesheets.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @returns {void}
   */
  static load(scene) {
    Object.values(LEVEL_ITEMS.textures).forEach((texture) => {
      if (scene.textures.exists(texture.key)) return;
      scene.load.spritesheet(texture.key, texture.path, {
        frameWidth: texture.frameWidth,
        frameHeight: texture.frameHeight,
      });
    });
    Object.values(LEVEL_ITEMS.pickupEffects).forEach((effect) => {
      if (scene.textures.exists(effect.textureKey)) return;
      scene.load.spritesheet(effect.textureKey, effect.path, {
        frameWidth: effect.frameWidth,
        frameHeight: effect.frameHeight,
      });
    });
    Object.values(LEVEL_ITEMS.pickupEffects).forEach((effect) => {
      const soundPath = effect.soundPaths ?? effect.soundPath;
      if (!soundPath) return;
      AssetLoaderSystem.loadAudio(scene, {
        key: effect.soundKey,
        path: soundPath,
      });
    });
  }

  /**
   * Registriert jede Item-Animation höchstens einmal im Animationsmanager.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @returns {void}
   */
  static registerAnimations(scene) {
    const animations = [
      ...Object.values(LEVEL_ITEMS.animations),
      ...Object.values(LEVEL_ITEMS.pickupEffects),
    ];

    animations.forEach((animation) => {
      if (scene.anims.exists(animation.key)) return;

      scene.anims.create({
        key: animation.key,
        frames: animation.frames.map((frame) => ({
          key: animation.textureKey,
          frame,
        })),
        frameRate: animation.frameRate,
        yoyo: animation.yoyo ?? false,
        repeat: animation.repeat ?? -1,
      });
    });
  }

  /**
   * Setzt die konfigurierten Testitems ins Level und startet ihre Animation.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {Phaser.Physics.Arcade.Sprite} player - Sammelnde Bulldogge.
   * @param {import("./health-system.class.js").HealthSystem} health - Lebenspunkte.
   * @param {import("./collectible-system.class.js").CollectibleSystem} collectibles - Itemzähler.
   * @param {ReadonlyArray<object>} [placements=LEVEL_ITEMS.placements] - Levelpositionen.
   * @returns {Phaser.GameObjects.Group} Gruppe aller sichtbaren Items.
   */
  static create(
    scene,
    player,
    health,
    collectibles,
    placements = LEVEL_ITEMS.placements,
  ) {
    this.registerAnimations(scene);
    const group = scene.add.group({ runChildUpdate: false });

    placements.forEach((placement) => {
      group.add(this.createItem(scene, placement));
    });
    this.bindPickupOverlap(scene, player, group, health, collectibles);
    return group;
  }

  /**
   * Erzeugt ein einzelnes physikbasiertes Item aus seiner Konfiguration.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {object} placement - Position, Typ und Darstellungsgröße.
   * @returns {Phaser.Physics.Arcade.Sprite} Fertiges Sammelobjekt.
   */
  static createItem(scene, placement) {
    const animation = LEVEL_ITEMS.animations[placement.type];
    const item = scene.physics.add
      .sprite(placement.x, placement.y, animation.textureKey, 0)
      .setDisplaySize(placement.size, placement.size)
      .setDepth(LEVEL_ITEMS.depth);
    item.setData({ itemType: placement.type, collected: false });
    this.configureBody(item);
    item.play(animation.key);
    return item;
  }

  /**
   * Konfiguriert eine unbewegliche Item-Hitbox ohne Schwerkraft.
   * @param {Phaser.Physics.Arcade.Sprite} item - Zu konfigurierendes Item.
   * @returns {void}
   */
  static configureBody(item) {
    item.body
      .setAllowGravity(false)
      .setImmovable(true)
      .setSize(LEVEL_ITEMS.body.width, LEVEL_ITEMS.body.height)
      .setOffset(LEVEL_ITEMS.body.offsetX, LEVEL_ITEMS.body.offsetY);
  }

  /**
   * Verbindet Bulldogge und Itemgruppe mit einer einzelnen Overlap-Prüfung.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {Phaser.Physics.Arcade.Sprite} player - Sammelnde Bulldogge.
   * @param {Phaser.GameObjects.Group} group - Gruppe der Sammelobjekte.
   * @param {import("./health-system.class.js").HealthSystem} health - Lebenspunkte.
   * @param {import("./collectible-system.class.js").CollectibleSystem} collectibles - Itemzähler.
   * @returns {void}
   */
  static bindPickupOverlap(scene, player, group, health, collectibles) {
    scene.physics.add.overlap(player, group, (_player, item) => {
      this.collect(scene, item, health, collectibles);
    });
  }

  /**
   * Wendet den konfigurierten Itemeffekt genau einmal an.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {Phaser.Physics.Arcade.Sprite} item - Berührtes Sammelobjekt.
   * @param {import("./health-system.class.js").HealthSystem} health - Lebenspunkte.
   * @param {import("./collectible-system.class.js").CollectibleSystem} collectibles - Itemzähler.
   * @returns {boolean} `true`, wenn das Item eingesammelt wurde.
   */
  static collect(scene, item, health, collectibles) {
    if (!item.active || item.getData("collected")) return false;

    const itemType = item.getData("itemType");
    const effect = LEVEL_ITEMS.effects[itemType];
    if (!this.canCollect(effect, health, collectibles)) return false;
    this.disableCollectedItem(item);
    this.applyEffect(effect, health, collectibles);
    this.playPickupEffect(scene, item, itemType);
    this.playPickupTween(scene, item);
    return true;
  }

  /**
   * Prüft, ob der konfigurierte Effekt aktuell aufgenommen werden darf.
   * @param {object|undefined} effect - Effekt des berührten Items.
   * @param {import("./health-system.class.js").HealthSystem} health - Lebenspunkte.
   * @param {import("./collectible-system.class.js").CollectibleSystem} collectibles - Itemzähler.
   * @returns {boolean} `true`, wenn eine Aufnahme möglich ist.
   */
  static canCollect(effect, health, collectibles) {
    if (!effect || (effect.healthAmount && health.isFull())) return false;
    if (!effect.blockAtMaximum) return true;
    return collectibles.getCount(effect.collectibleKey) < effect.maximum;
  }

  /**
   * Sperrt ein Item unmittelbar gegen weitere Overlap-Auslösungen.
   * @param {Phaser.Physics.Arcade.Sprite} item - Eingesammeltes Item.
   * @returns {void}
   */
  static disableCollectedItem(item) {
    item.setData("collected", true);
    item.body.enable = false;
    item.anims.stop();
  }

  /**
   * Wendet Heilung oder Zähleränderung anhand der Konfiguration an.
   * @param {object} effect - Effekt des eingesammelten Items.
   * @param {import("./health-system.class.js").HealthSystem} health - Lebenspunkte.
   * @param {import("./collectible-system.class.js").CollectibleSystem} collectibles - Itemzähler.
   * @returns {void}
   */
  static applyEffect(effect, health, collectibles) {
    if (effect.healthAmount) {
      health.heal(effect.healthAmount);
      return;
    }
    collectibles.collect(
      effect.collectibleKey,
      effect.amount,
      effect.maximum,
    );
  }

  /**
   * Spielt den optionalen, einmaligen Aufnahmeeffekt am Item-Ursprung ab.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {Phaser.GameObjects.Sprite} item - Eingesammeltes Item.
   * @param {string} itemType - Konfigurierter Typ des Items.
   * @returns {Phaser.GameObjects.Sprite|null} Erzeugter Effekt oder `null`.
   */
  static playPickupEffect(scene, item, itemType) {
    const effect = LEVEL_ITEMS.pickupEffects[itemType];
    if (!effect) return null;

    this.playPickupSound(scene, effect);
    const effectSprite = scene.add
      .sprite(
        item.x + (effect.offsetX ?? 0),
        item.y + (effect.offsetY ?? 0),
        effect.textureKey,
        0,
      )
      .setDisplaySize(effect.displayWidth, effect.displayHeight)
      .setAngle(effect.angle ?? 0)
      .setDepth(LEVEL_ITEMS.depth + 1);
    effectSprite.once("animationcomplete", () => effectSprite.destroy());
    effectSprite.play(effect.key);
    return effectSprite;
  }

  /**
   * Spielt den optionalen Itemklang genau beim Start des Aufnahmeeffekts ab.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {{soundKey?: string, soundVolume?: number}} effect - Effektwerte.
   * @returns {boolean} Ob der Sound abgespielt werden konnte.
   */
  static playPickupSound(scene, effect) {
    if (!effect.soundKey || !scene.cache.audio.exists(effect.soundKey)) {
      return false;
    }
    scene.sound.play(effect.soundKey, {
      volume: effect.soundVolume ?? 1,
    });
    return true;
  }

  /**
   * Blendet ein eingesammeltes Item kurz vergrößert aus.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {Phaser.GameObjects.Sprite} item - Eingesammeltes Item.
   * @returns {void}
   */
  static playPickupTween(scene, item) {
    scene.tweens.add({
      targets: item,
      alpha: 0,
      scaleX: item.scaleX * 1.25,
      scaleY: item.scaleY * 1.25,
      duration: LEVEL_ITEMS.pickupTweenMs,
      ease: "Quad.easeOut",
      onComplete: () => item.destroy(),
    });
  }
}
