import { HealthBar } from "../ui/health-bar.class.js";
import { CollectibleCounter } from "../ui/collectible-counter.class.js";
import { MutationBar } from "../ui/mutation-bar.class.js";
import { MutationReadyPrompt } from "../ui/mutation-ready-prompt.class.js";
import { HealthSystem } from "./health-system.class.js";
import { CollectibleSystem } from "./collectible-system.class.js";
import { MutationSystem } from "./mutation-system.class.js";
import { COLLECTIBLE_KEYS, HUD } from "../../js/config/hud-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Manages level hud system behavior.
 */
export class LevelHudSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    [HUD.health, HUD.coin, HUD.serum, HUD.mutation].forEach((asset) => {
      AssetLoaderSystem.loadImage(scene, {
        key: asset.textureKey,
        path: asset.path,
      });
    });
  }

  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {{health?: number, collectibles?: Record<string, number>}} [initialState={}] - The initial state value.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog|null} [player=null] - The player-controlled bulldog.
   * @returns {{health: HealthSystem, collectibles: CollectibleSystem, mutation: MutationSystem}} The created instance.
   */
  static create(scene, initialState = {}, player = null) {
    const health = this.createHealthSystem(initialState);
    const collectibles = this.createCollectibleSystem(initialState);
    const mutation = this.createMutationSystem(
      scene,
      health,
      collectibles,
      player,
    );
    return { health, collectibles, mutation };
  }

  /**
   * Creates health system.
   * @param {object} initialState - The initial state value.
   * @returns {HealthSystem} The created instance.
   */
  static createHealthSystem(initialState) {
    const current = initialState.health ?? HUD.health.maximum;
    return new HealthSystem(HUD.health.maximum, current);
  }

  /**
   * Creates collectible system.
   * @param {object} initialState - The initial state value.
   * @returns {CollectibleSystem} The created instance.
   */
  static createCollectibleSystem(initialState) {
    return new CollectibleSystem(
      Object.values(COLLECTIBLE_KEYS),
      initialState.collectibles,
    );
  }

  /**
   * Creates mutation system.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {HealthSystem} health - The associated health system.
   * @param {CollectibleSystem} collectibles - The collectibles value.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog|null} player - The player-controlled bulldog.
   * @returns {MutationSystem} The created instance.
   */
  static createMutationSystem(scene, health, collectibles, player) {
    const healthBar = new HealthBar(scene, health);
    const counters = this.createCollectibleCounters(scene, collectibles);
    const mutationBar = new MutationBar(scene);
    const mutationReady = new MutationReadyPrompt(scene, collectibles);
    return new MutationSystem(
      scene,
      collectibles,
      [healthBar, ...counters, mutationReady],
      mutationBar,
      player,
    );
  }

  /**
   * Creates collectible counters.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {CollectibleSystem} collectibles - The collectibles value.
   * @returns {CollectibleCounter[]} The resulting collection.
   */
  static createCollectibleCounters(scene, collectibles) {
    const coin = new CollectibleCounter(
      scene,
      COLLECTIBLE_KEYS.coins,
      HUD.coin,
      collectibles,
    );
    const serum = new CollectibleCounter(
      scene,
      COLLECTIBLE_KEYS.serum,
      HUD.serum,
      collectibles,
    );
    return [coin, serum];
  }
}
