import { COLLECTIBLE_KEYS, HUD } from "../../js/config/hud-settings.js";
import {
  BULLDOG_ANIMATION_TIMING,
  BULLDOG_EVENTS,
} from "../../js/config/bulldog-animation-settings.js";
import { BulldogMutationStateSystem } from
  "./bulldog-mutation-state-system.class.js";

/**
 * Manages mutation system behavior.
 */
export class MutationSystem {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {import("./collectible-system.class.js").CollectibleSystem} collectibles - The collectibles value.
   * @param {Phaser.GameObjects.Container[]} normalHud - The normal hud value.
   * @param {import("../ui/mutation-bar.class.js").MutationBar} mutationBar - The mutation bar value.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog|null} player - The player-controlled bulldog.
   */
  constructor(scene, collectibles, normalHud, mutationBar, player) {
    this.scene = scene;
    this.collectibles = collectibles;
    this.normalHud = normalHud;
    this.mutationBar = mutationBar;
    this.player = player;
    this.isActive = false;
    this.holdEvent = null;
    this.normalHudPositions = normalHud.map((item) => item.x);
  }

  /**
   * Updates the current state.
   * @param {import("../input/input-system.class.js").InputSystem} input - The active input system.
   * @returns {boolean} Whether the requested condition is met.
   */
  update(input) {
    if (!input.consumeMutation()) return false;
    const wasActivated = this.activate();
    if (wasActivated) input.discardAttack();
    return wasActivated;
  }

  /**
   * Handles activate.
   * @returns {boolean} Whether the requested condition is met.
   */
  activate() {
    if (this.isActive || !this.hasFullSerum()) return false;
    if (!this.player?.startMutation()) return false;
    this.isActive = true;
    this.player.once(
      BULLDOG_EVENTS.mutationCompleted,
      () => this.beginEnergyHold(),
    );
    this.collectibles.setCount(COLLECTIBLE_KEYS.serum, 0);
    this.hideNormalHud();
    this.mutationBar.fill();
    this.mutationBar.show();
    return true;
  }

  /**
   * Starts energy hold.
   */
  beginEnergyHold() {
    this.mutationBar.fill();
    this.holdEvent = this.scene.time.delayedCall(
      BULLDOG_ANIMATION_TIMING.mutationFullHoldMs,
      () => this.beginEnergyDrain(),
    );
  }

  /**
   * Starts energy drain.
   */
  beginEnergyDrain() {
    this.holdEvent = null;
    this.mutationBar.drain(
      BULLDOG_ANIMATION_TIMING.mutationDrainMs,
      () => this.deactivate(),
    );
  }

  /**
   * Handles deactivate.
   * @returns {boolean} Whether the requested condition is met.
   */
  deactivate() {
    if (!this.isActive) return false;
    if (!BulldogMutationStateSystem.revert(this.player)) return false;
    this.player.once(
      BULLDOG_EVENTS.mutationReverted,
      () => this.finishDeactivation(),
    );
    this.mutationBar.hide();
    this.showNormalHud();
    return true;
  }

  /**
   * Completes deactivation.
   */
  finishDeactivation() {
    this.isActive = false;
  }

  /**
   * Checks the full serum condition.
   * @returns {boolean} Whether the requested condition is met.
   */
  hasFullSerum() {
    return this.collectibles.getCount(COLLECTIBLE_KEYS.serum) >=
      HUD.serum.fill.maximum;
  }

  /**
   * Hides normal hud.
   * @returns {Phaser.Tweens.Tween} The resulting value.
   */
  hideNormalHud() {
    const settings = HUD.mutation;
    return this.scene.tweens.add({
      targets: this.normalHud,
      x: settings.normalHudExitX,
      alpha: 0,
      duration: settings.exitDurationMs,
      ease: "Back.easeIn",
      onComplete: () => this.hideNormalHudContainers(),
    });
  }

  /**
   * Hides normal hud containers.
   * @returns {void} No value is returned.
   */
  hideNormalHudContainers() {
    this.normalHud.forEach((item) => item.setVisible(false));
  }

  /**
   * Shows normal hud.
   */
  showNormalHud() {
    const settings = HUD.mutation;
    this.normalHud.forEach((item, index) => {
      this.restoreHudItemVisibility(item);
      this.scene.tweens.add({
        targets: item,
        x: this.normalHudPositions[index],
        alpha: 1,
        duration: settings.entryDurationMs,
        ease: "Back.easeOut",
      });
    });
  }

  /**
   * Restores hud item visibility.
   * @param {Phaser.GameObjects.GameObject} item - The collectible item instance.
   * @returns {void} No value is returned.
   */
  restoreHudItemVisibility(item) {
    if (typeof item.restoreVisibility === "function") {
      item.restoreVisibility();
      return;
    }
    item.setVisible(true);
  }
}
