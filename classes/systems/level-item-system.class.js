import { LEVEL_ITEMS } from "../../js/config/level-item-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";
import { ItemFeedbackSystem } from "./item-feedback-system.class.js";

/**
 * Manages level item system behavior.
 */
export class LevelItemSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    Object.values(LEVEL_ITEMS.textures).forEach((texture) =>
      this.loadSpritesheet(scene, texture, texture.key));
    Object.values(LEVEL_ITEMS.pickupEffects).forEach((effect) =>
      this.loadPickupEffect(scene, effect));
  }

  /**
   * Loads pickup effect.
   */
  static loadPickupEffect(scene, effect) {
    this.loadSpritesheet(scene, effect, effect.textureKey);
    this.loadPickupSound(scene, effect);
  }

  /**
   * Loads spritesheet.
   */
  static loadSpritesheet(scene, settings, key) {
    if (scene.textures.exists(key)) return;
    scene.load.spritesheet(key, settings.path, {
      frameWidth: settings.frameWidth,
      frameHeight: settings.frameHeight,
    });
  }

  /**
   * Loads pickup sound.
   */
  static loadPickupSound(scene, effect) {
    const path = effect.soundPaths ?? effect.soundPath;
    if (!path) return;
    AssetLoaderSystem.loadAudio(scene, { key: effect.soundKey, path });
  }

  /**
   * Registers animations.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static registerAnimations(scene) {
    const animations = [
      ...Object.values(LEVEL_ITEMS.animations),
      ...Object.values(LEVEL_ITEMS.pickupEffects),
    ];

    animations.forEach((animation) =>
      this.registerAnimation(scene, animation));
  }

  /**
   * Registers animation.
   */
  static registerAnimation(scene, animation) {
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
  }

  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @param {import("./collectible-system.class.js").CollectibleSystem} collectibles - The collectibles value.
   * @param {ReadonlyArray<object>} [placements=LEVEL_ITEMS.placements.initial] - The placements value.
   * @returns {Phaser.GameObjects.Group} The resulting data object.
   */
  static create(
    scene,
    player,
    health,
    collectibles,
    placements = LEVEL_ITEMS.placements.initial,
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
   * Adds placements.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Group} group - The Phaser group to process.
   * @param {ReadonlyArray<object>} placements - The placements value.
   * @returns {Phaser.GameObjects.Group} The resulting data object.
   */
  static addPlacements(scene, group, placements) {
    placements.forEach((placement) => {
      group.add(this.createItem(scene, placement));
    });
    return group;
  }

  /**
   * Drops one item from a world object onto its configured target height.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Group} group - The Phaser group to process.
   * @param {{x: number, y: number}} source - The defeated source object.
   * @param {object} settings - The item drop settings.
   * @returns {Phaser.Physics.Arcade.Sprite} The dropped item instance.
   */
  static addDrop(scene, group, source, settings) {
    const placement = this.createDropPlacement(source, settings);
    const item = this.createItem(scene, placement);
    group.add(item);
    this.playDropTween(scene, item, settings);
    return item;
  }

  /**
   * Creates one runtime item placement from a defeated source object.
   * @param {{x: number, y: number}} source - The defeated source object.
   * @param {object} settings - The item drop settings.
   * @returns {{type: string, x: number, y: number, size: number}} The placement.
   */
  static createDropPlacement(source, settings) {
    return {
      type: settings.type,
      x: source.x + settings.offsetX,
      y: source.y + settings.offsetY,
      size: settings.size,
    };
  }

  /**
   * Animates a dropped item onto the configured ground height.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.Sprite} item - The dropped item instance.
   * @param {object} settings - The item drop settings.
   * @returns {void} No value is returned.
   */
  static playDropTween(scene, item, settings) {
    scene.tweens.add({
      targets: item,
      y: settings.targetY,
      duration: settings.durationMs,
      ease: settings.ease,
    });
  }

  /**
   * Creates item.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} placement - The placement value.
   * @returns {Phaser.Physics.Arcade.Sprite} The created instance.
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
   * Configures body.
   * @param {Phaser.Physics.Arcade.Sprite} item - The collectible item instance.
   * @returns {void} No value is returned.
   */
  static configureBody(item) {
    item.body
      .setAllowGravity(false)
      .setImmovable(true)
      .setSize(LEVEL_ITEMS.body.width, LEVEL_ITEMS.body.height)
      .setOffset(LEVEL_ITEMS.body.offsetX, LEVEL_ITEMS.body.offsetY);
  }

  /**
   * Binds pickup overlap.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {Phaser.GameObjects.Group} group - The Phaser group to process.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @param {import("./collectible-system.class.js").CollectibleSystem} collectibles - The collectibles value.
   * @returns {void} No value is returned.
   */
  static bindPickupOverlap(scene, player, group, health, collectibles) {
    scene.physics.add.overlap(player, group, (_player, item) => {
      this.collect(scene, item, health, collectibles);
    });
  }

  /**
   * Collects the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.Sprite} item - The collectible item instance.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @param {import("./collectible-system.class.js").CollectibleSystem} collectibles - The collectibles value.
   * @returns {boolean} Whether the requested condition is met.
   */
  static collect(scene, item, health, collectibles) {
    if (!item.active || item.getData("collected")) return false;

    const itemType = item.getData("itemType");
    const effect = LEVEL_ITEMS.effects[itemType];
    if (!this.canCollect(effect, health, collectibles)) {
      this.showBlockedFeedback(scene, item, effect, health);
      return false;
    }
    this.disableCollectedItem(item);
    this.applyEffect(effect, health, collectibles);
    this.playPickupEffect(scene, item, itemType);
    this.playPickupTween(scene, item);
    return true;
  }

  /**
   * Checks the collect condition.
   * @param {object|undefined} effect - The effect value.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @param {import("./collectible-system.class.js").CollectibleSystem} collectibles - The collectibles value.
   * @returns {boolean} Whether the requested condition is met.
   */
  static canCollect(effect, health, collectibles) {
    if (!effect || (effect.healthAmount && health.isFull())) return false;
    if (!effect.blockAtMaximum) return true;
    return collectibles.getCount(effect.collectibleKey) < effect.maximum;
  }

  /**
   * Shows blocked feedback.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.Sprite} item - The collectible item instance.
   * @param {object|undefined} effect - The effect value.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @returns {boolean} Whether the requested condition is met.
   */
  static showBlockedFeedback(scene, item, effect, health) {
    if (!effect?.healthAmount || !health.isFull()) return false;
    return ItemFeedbackSystem.showFullHealth(scene, item);
  }

  /**
   * Handles disable collected item.
   * @param {Phaser.Physics.Arcade.Sprite} item - The collectible item instance.
   * @returns {void} No value is returned.
   */
  static disableCollectedItem(item) {
    item.setData("collected", true);
    item.body.enable = false;
    item.anims.stop();
  }

  /**
   * Applies effect.
   * @param {object} effect - The effect value.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @param {import("./collectible-system.class.js").CollectibleSystem} collectibles - The collectibles value.
   * @returns {void} No value is returned.
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
   * Plays pickup effect.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} item - The collectible item instance.
   * @param {string} itemType - The item type value.
   * @returns {Phaser.GameObjects.Sprite|null} The resulting data object.
   */
  static playPickupEffect(scene, item, itemType) {
    const effect = LEVEL_ITEMS.pickupEffects[itemType];
    if (!effect) return null;

    this.playPickupSound(scene, effect);
    const effectSprite = this.createPickupEffectSprite(scene, item, effect);
    effectSprite.once("animationcomplete", () => effectSprite.destroy());
    effectSprite.play(effect.key);
    return effectSprite;
  }

  /**
   * Creates pickup effect sprite.
   */
  static createPickupEffectSprite(scene, item, effect) {
    return scene.add.sprite(
      item.x + (effect.offsetX ?? 0),
      item.y + (effect.offsetY ?? 0),
      effect.textureKey,
      0,
    )
      .setDisplaySize(effect.displayWidth, effect.displayHeight)
      .setAngle(effect.angle ?? 0)
      .setDepth(LEVEL_ITEMS.depth + 1);
  }

  /**
   * Plays pickup sound.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {{soundKey?: string, soundVolume?: number}} effect - The effect value.
   * @returns {boolean} Whether the requested condition is met.
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
   * Plays pickup tween.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} item - The collectible item instance.
   * @returns {void} No value is returned.
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
