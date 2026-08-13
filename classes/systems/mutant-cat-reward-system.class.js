import { LevelItemSystem } from "./level-item-system.class.js";
import { MUTANT_CAT_EVENTS } from
  "../../js/config/mutant-cat-settings.js";
import { isFastMutantCatDefeat, MUTANT_CAT_REWARD } from
  "../../js/config/mutant-cat-reward-settings.js";

/**
 * Manages mutant cat reward system behavior.
 */
export class MutantCatRewardSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    LevelItemSystem.load(scene);
  }

  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @param {import("./collectible-system.class.js").CollectibleSystem} collectibles - The collectibles value.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat[]} cats - The cats value.
   * @returns {MutantCatRewardSystem} The created instance.
   */
  static create(scene, player, health, collectibles, cats) {
    LevelItemSystem.registerAnimations(scene);
    const rewardSystem = new MutantCatRewardSystem(
      scene,
      player,
      health,
      collectibles,
    );
    rewardSystem.bindDefeats(cats);
    return rewardSystem;
  }

  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @param {import("./collectible-system.class.js").CollectibleSystem} collectibles - The collectibles value.
   */
  constructor(scene, player, health, collectibles) {
    this.scene = scene;
    this.group = scene.add.group({ runChildUpdate: false });
    this.rewardedCats = new WeakSet();
    LevelItemSystem.bindPickupOverlap(
      scene,
      player,
      this.group,
      health,
      collectibles,
    );
  }

  /**
   * Binds defeats.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat[]} cats - The cats value.
   * @returns {void} No value is returned.
   */
  bindDefeats(cats) {
    cats.forEach((cat) => this.bindDefeat(cat));
  }

  /**
   * Binds defeat.
   * @param {Phaser.GameObjects.Sprite} cat - The mutant cat instance.
   * @returns {void} No value is returned.
   */
  bindDefeat(cat) {
    cat.once(MUTANT_CAT_EVENTS.defeated, (result) => {
      this.spawnReward(cat, result);
    });
  }

  /**
   * Handles spawn reward.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat} cat - The mutant cat instance.
   * @param {{x: number, y: number, elapsedMs: number}} result - The result value.
   * @returns {void} No value is returned.
   */
  spawnReward(cat, result) {
    if (this.rewardedCats.has(cat)) return;
    this.rewardedCats.add(cat);

    if (isFastMutantCatDefeat(result.elapsedMs)) {
      this.spawnGoldenCoin(result);
      return;
    }
    this.spawnHealthItems(result);
  }

  /**
   * Handles spawn golden coin.
   * @param {{x: number, y: number}} result - The result value.
   * @returns {void} No value is returned.
   */
  spawnGoldenCoin(result) {
    this.addItem(
      "goldenCoin",
      result.x,
      result.y,
      MUTANT_CAT_REWARD.goldenCoinSize,
    );
  }

  /**
   * Handles spawn health items.
   * @param {{x: number, y: number}} result - The result value.
   * @returns {void} No value is returned.
   */
  spawnHealthItems(result) {
    const offsetX = MUTANT_CAT_REWARD.healthItemOffsetX;
    this.addItem("health", result.x - offsetX, result.y,
      MUTANT_CAT_REWARD.healthItemSize);
    this.addItem("health", result.x + offsetX, result.y,
      MUTANT_CAT_REWARD.healthItemSize);
  }

  /**
   * Adds item.
   * @param {string} type - The requested item type.
   * @param {number} x - The horizontal position.
   * @param {number} y - The vertical position.
   * @param {number} size - The size value.
   * @returns {Phaser.Physics.Arcade.Sprite} The resulting value.
   */
  addItem(type, x, y, size) {
    const item = LevelItemSystem.createItem(this.scene, {
      type,
      x,
      y: y - MUTANT_CAT_REWARD.dropOffsetY,
      size,
    });
    this.group.add(item);
    return item;
  }
}
