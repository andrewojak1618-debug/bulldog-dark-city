import {
  BULLDOG_ANIMATION_KEYS,
  BULLDOG_ANIMATION_TIMING,
  BULLDOG_TEXTURES,
} from "../../js/config/bulldog-animation-settings.js";

/**
 * Manages bulldog movement animation system behavior.
 */
export class BulldogMovementAnimationSystem {
  /**
   * Updates the current state.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {-1|0|1} direction - The horizontal movement direction.
   * @returns {void} No value is returned.
   */
  static update(player, direction) {
    if (player.isMutated) {
      this.updateMutationMovement(player, direction);
      return;
    }
    const isGrounded = player.isGrounded();
    const verticalVelocity = player.body.velocity.y;
    const isFalling = verticalVelocity > 0 && !isGrounded;
    this.updateJump(player, verticalVelocity < 0);
    this.updateFall(player, isFalling);
    if (this.updateLanding(player, isFalling, isGrounded)) {
      player.standingStartedAt = null;
      return;
    }
    this.updateRun(player, direction, isGrounded);
    this.updateWait(player, direction, isGrounded);
  }

  /**
   * Updates mutation movement.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {-1|0|1} direction - The horizontal movement direction.
   * @returns {void} No value is returned.
   */
  static updateMutationMovement(player, direction) {
    const isGrounded = player.isGrounded();
    if (!isGrounded) {
      this.updateMutationJump(player);
      return;
    }
    if (this.updateMutationLanding(player)) return;
    const isRunning = direction !== 0;
    const animationKey = isRunning
      ? BULLDOG_ANIMATION_KEYS.mutationWalk
      : BULLDOG_ANIMATION_KEYS.mutationIdle;
    player.play(animationKey, true);
  }

  /**
   * Updates mutation jump.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static updateMutationJump(player) {
    player.wasMutationAirborne = true;
    const currentKey = player.anims.currentAnim?.key;
    if (currentKey !== BULLDOG_ANIMATION_KEYS.mutationJump) {
      player.play(BULLDOG_ANIMATION_KEYS.mutationJump);
    }
  }

  /**
   * Updates mutation landing.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static updateMutationLanding(player) {
    if (player.wasMutationAirborne) {
      player.wasMutationAirborne = false;
      player.play(BULLDOG_ANIMATION_KEYS.mutationLand);
      return true;
    }
    return player.anims.currentAnim?.key ===
      BULLDOG_ANIMATION_KEYS.mutationLand && player.anims.isPlaying;
  }

  /**
   * Updates jump.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {boolean} isJumping - The is jumping value.
   * @returns {void} No value is returned.
   */
  static updateJump(player, isJumping) {
    if (isJumping) {
      player.play(BULLDOG_ANIMATION_KEYS.jump, true);
      return;
    }
    if (player.anims.currentAnim?.key !== BULLDOG_ANIMATION_KEYS.jump) return;
    player.anims.stop();
    player.showStandFrame();
  }

  /**
   * Updates fall.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {boolean} isFalling - The is falling value.
   * @returns {void} No value is returned.
   */
  static updateFall(player, isFalling) {
    if (isFalling) {
      player.play(BULLDOG_ANIMATION_KEYS.fall, true);
      return;
    }
    if (player.anims.currentAnim?.key !== BULLDOG_ANIMATION_KEYS.fall) return;
    player.anims.stop();
    player.showStandFrame();
  }

  /**
   * Updates landing.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {boolean} isFalling - The is falling value.
   * @param {boolean} isGrounded - The is grounded value.
   * @returns {boolean} Whether the requested condition is met.
   */
  static updateLanding(player, isFalling, isGrounded) {
    const hasJustLanded = player.wasFalling && isGrounded;
    player.wasFalling = isFalling;
    if (hasJustLanded && !player.isLanding) {
      player.isLanding = true;
      player.play(BULLDOG_ANIMATION_KEYS.land);
    }
    if (!player.isLanding) return false;
    if (this.isLandingAnimationPlaying(player)) return true;
    player.isLanding = false;
    player.showStandFrame();
    return false;
  }

  /**
   * Checks the landing animation playing condition.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isLandingAnimationPlaying(player) {
    return player.anims.currentAnim?.key === BULLDOG_ANIMATION_KEYS.land &&
      player.anims.isPlaying;
  }

  /**
   * Updates run.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {-1|0|1} direction - The horizontal movement direction.
   * @param {boolean} isGrounded - The is grounded value.
   * @returns {void} No value is returned.
   */
  static updateRun(player, direction, isGrounded) {
    const isRunning = direction !== 0 && player.body.velocity.y === 0 &&
      isGrounded;
    if (isRunning) {
      player.play(BULLDOG_ANIMATION_KEYS.run, true);
      return;
    }
    if (player.anims.currentAnim?.key !== BULLDOG_ANIMATION_KEYS.run) return;
    player.anims.stop();
    player.showStandFrame();
  }

  /**
   * Updates wait.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {-1|0|1} direction - The horizontal movement direction.
   * @param {boolean} isGrounded - The is grounded value.
   * @returns {void} No value is returned.
   */
  static updateWait(player, direction, isGrounded) {
    const isStanding = direction === 0 && player.body.velocity.y === 0 &&
      isGrounded;
    if (!isStanding) {
      player.standingStartedAt = null;
      this.stopWait(player);
      return;
    }
    player.standingStartedAt ??= player.scene.time.now;
    this.playWaitState(player);
  }

  /**
   * Plays wait state.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static playWaitState(player) {
    const standingDuration = player.scene.time.now - player.standingStartedAt;
    if (standingDuration < BULLDOG_ANIMATION_TIMING.waitDelayMs) return;
    const seatedDuration = standingDuration -
      BULLDOG_ANIMATION_TIMING.waitDelayMs;
    if (seatedDuration < BULLDOG_ANIMATION_TIMING.waitSeatedPauseMs) {
      this.showSeatedFrame(player);
      return;
    }
    player.play(BULLDOG_ANIMATION_KEYS.waitBreathe, true);
    player.startWaitBreathing();
  }

  /**
   * Stops wait.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static stopWait(player) {
    player.stopWaitBreathing();
    const isWaiting = player.texture.key === BULLDOG_TEXTURES.sit.key ||
      player.texture.key === BULLDOG_TEXTURES.waitBreathe.key;
    if (!isWaiting) return;
    player.anims.stop();
    player.showStandFrame();
  }

  /**
   * Shows seated frame.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static showSeatedFrame(player) {
    player.stopWaitBreathing();
    if (player.texture.key === BULLDOG_TEXTURES.sit.key) return;
    player.anims.stop();
    player.setTexture(BULLDOG_TEXTURES.sit.key, 0);
  }
}
