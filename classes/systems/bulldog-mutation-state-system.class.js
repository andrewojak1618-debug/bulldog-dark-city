import {
  BULLDOG_ANIMATION_KEYS,
  BULLDOG_ANIMATION_TIMING,
  BULLDOG_EVENTS,
  BULLDOG_TEXTURES,
} from "../../js/config/bulldog-animation-settings.js";
import { BULLDOG_GAMEPLAY } from
  "../../js/config/bulldog-gameplay-settings.js";

const ANIMATION_COMPLETE_PREFIX = "animationcomplete-";

/**
 * Manages bulldog mutation state system behavior.
 */
export class BulldogMutationStateSystem {
  /**
   * Initializes the current state.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static initialize(player) {
    player.isMutating = false;
    player.isMutated = false;
    player.wasMutationAirborne = false;
    player.nextMutationAttackSide = "left";
    player.mutationFallbackEvent = null;
  }

  /**
   * Starts the current state.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static start(player) {
    if (!this.canStart(player)) return false;
    this.prepareTransformation(player);
    this.applyVisuals(player);
    this.registerCompletion(player);
    return true;
  }

  /**
   * Checks the start condition.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static canStart(player) {
    return !player.isMutating && !player.isMutated && !player.isKnockedOut;
  }

  /**
   * Checks the receive normal damage condition.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static canReceiveNormalDamage(player) {
    return !player.isMutating && !player.isMutated;
  }

  /**
   * Handles prepare transformation.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static prepareTransformation(player) {
    player.isMutating = true;
    player.cancelActiveActionStates();
    player.setVelocity(0, 0);
    player.play(BULLDOG_ANIMATION_KEYS.mutationTransform);
  }

  /**
   * Applies visuals.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static applyVisuals(player) {
    const feetY = player.body.bottom;
    const settings = BULLDOG_GAMEPLAY.mutation;
    player.setDisplaySize(settings.displayWidth, settings.displayHeight);
    player.body.setSize(settings.bodyWidth, settings.bodyHeight)
      .setOffset(settings.bodyOffsetX, settings.bodyOffsetY);
    player.body.updateFromGameObject();
    player.y += feetY - player.body.bottom;
    player.body.updateFromGameObject();
  }

  /**
   * Registers completion.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static registerCompletion(player) {
    player.once(this.getCompleteEventName(), () => this.finish(player));
    player.mutationFallbackEvent = player.scene.time.delayedCall(
      BULLDOG_ANIMATION_TIMING.mutationFallbackMs,
      () => this.finish(player),
    );
  }

  /**
   * Returns complete event name.
   * @returns {string} The resulting string value.
   */
  static getCompleteEventName() {
    return ANIMATION_COMPLETE_PREFIX +
      BULLDOG_ANIMATION_KEYS.mutationTransform;
  }

  /**
   * Completes the current state.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static finish(player) {
    if (!player.isMutating) return;
    this.clearTransition(player, this.getCompleteEventName());
    player.isMutating = false;
    player.isMutated = true;
    player.play(BULLDOG_ANIMATION_KEYS.mutationIdle);
    player.emit(BULLDOG_EVENTS.mutationCompleted);
  }

  /**
   * Handles revert.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static revert(player) {
    if (!player.isMutated || player.isMutating || player.isKnockedOut) {
      return false;
    }
    player.isMutating = true;
    player.cancelActiveActionStates();
    player.setVelocity(0, 0);
    player.play(BULLDOG_ANIMATION_KEYS.mutationRevert);
    this.registerReversionCompletion(player);
    return true;
  }

  /**
   * Registers reversion completion.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static registerReversionCompletion(player) {
    const eventName = this.getRevertCompleteEventName();
    player.once(eventName, () => this.finishReversion(player));
    player.mutationFallbackEvent = player.scene.time.delayedCall(
      BULLDOG_ANIMATION_TIMING.mutationFallbackMs,
      () => this.finishReversion(player),
    );
  }

  /**
   * Returns revert complete event name.
   * @returns {string} The resulting string value.
   */
  static getRevertCompleteEventName() {
    return ANIMATION_COMPLETE_PREFIX +
      BULLDOG_ANIMATION_KEYS.mutationRevert;
  }

  /**
   * Completes reversion.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static finishReversion(player) {
    if (!player.isMutating || !player.isMutated) return;
    this.clearTransition(player, this.getRevertCompleteEventName());
    player.isMutating = false;
    player.isMutated = false;
    this.restoreNormalVisuals(player);
    player.emit(BULLDOG_EVENTS.mutationReverted);
  }

  /**
   * Restores normal visuals.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static restoreNormalVisuals(player) {
    const feetY = player.body.bottom;
    player.setTexture(BULLDOG_TEXTURES.stand.key, 0);
    player.setDisplaySize(
      BULLDOG_GAMEPLAY.displayWidth,
      BULLDOG_GAMEPLAY.displayHeight,
    );
    player.body.setSize(BULLDOG_GAMEPLAY.bodyWidth, BULLDOG_GAMEPLAY.bodyHeight)
      .setOffset(BULLDOG_GAMEPLAY.bodyOffsetX, BULLDOG_GAMEPLAY.bodyOffsetY);
    player.body.updateFromGameObject();
    player.y += feetY - player.body.bottom;
    player.body.updateFromGameObject();
  }

  /**
   * Clears transition.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {string} eventName - The event name value.
   * @returns {void} No value is returned.
   */
  static clearTransition(player, eventName) {
    player.off(eventName);
    player.mutationFallbackEvent?.remove(false);
    player.mutationFallbackEvent = null;
  }

  /**
   * Returns next attack animation key.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {string} The resulting string value.
   */
  static getNextAttackAnimationKey(player) {
    if (!player.isMutated) return BULLDOG_ANIMATION_KEYS.biteAttack;
    const usesLeftArm = player.nextMutationAttackSide === "left";
    player.nextMutationAttackSide = usesLeftArm ? "right" : "left";
    return usesLeftArm
      ? BULLDOG_ANIMATION_KEYS.mutationAttackLeft
      : BULLDOG_ANIMATION_KEYS.mutationAttackRight;
  }
}
