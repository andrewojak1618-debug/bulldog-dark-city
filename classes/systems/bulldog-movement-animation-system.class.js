import {
  BULLDOG_ANIMATION_KEYS,
  BULLDOG_ANIMATION_TIMING,
  BULLDOG_TEXTURES,
} from "../../js/config/bulldog-animation-settings.js";

/**
 * Steuert die bewegungsabhängigen Animationen der normalen Bulldogge.
 */
export class BulldogMovementAnimationSystem {
  /**
   * Wählt anhand der Physik den passenden Luft- oder Bodenstatus.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @param {-1|0|1} direction - Horizontale Bewegungsrichtung.
   * @returns {void}
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
   * Wechselt die mutierte Bulldogge zwischen Boden- und Luftanimationen.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @param {-1|0|1} direction - Horizontale Bewegungsrichtung.
   * @returns {void}
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
   * Startet die Mutations-Sprunganimation in der Luft genau einmal.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {void}
   */
  static updateMutationJump(player) {
    player.wasMutationAirborne = true;
    const currentKey = player.anims.currentAnim?.key;
    if (currentKey !== BULLDOG_ANIMATION_KEYS.mutationJump) {
      player.play(BULLDOG_ANIMATION_KEYS.mutationJump);
    }
  }

  /**
   * Spielt nach dem ersten Bodenkontakt den separaten Landeframe.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {boolean} `true`, solange die Landung den Zustand übernimmt.
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
   * Spielt oder beendet die Sprunganimation.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @param {boolean} isJumping - Ob sich die Bulldogge aufwärts bewegt.
   * @returns {void}
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
   * Spielt oder beendet die Fallanimation.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @param {boolean} isFalling - Ob die Bulldogge frei abwärts fällt.
   * @returns {void}
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
   * Aktualisiert die einmalige Landesequenz.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @param {boolean} isFalling - Ob die Bulldogge frei fällt.
   * @param {boolean} isGrounded - Ob sie den Boden berührt.
   * @returns {boolean} `true`, solange die Landesequenz aktiv ist.
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
   * Prüft, ob die Landesequenz noch abgespielt wird.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {boolean} Aktiver Zustand der Landesequenz.
   */
  static isLandingAnimationPlaying(player) {
    return player.anims.currentAnim?.key === BULLDOG_ANIMATION_KEYS.land &&
      player.anims.isPlaying;
  }

  /**
   * Spielt die Laufanimation nur während einer Bodenbewegung.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @param {-1|0|1} direction - Horizontale Bewegungsrichtung.
   * @param {boolean} isGrounded - Ob die Bulldogge den Boden berührt.
   * @returns {void}
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
   * Startet nach längerer Ruhe Sitzhaltung und Atemschleife.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @param {-1|0|1} direction - Horizontale Bewegungsrichtung.
   * @param {boolean} isGrounded - Ob die Bulldogge den Boden berührt.
   * @returns {void}
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
   * Zeigt abhängig von der bisherigen Wartezeit Sitzen oder Atmen.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {void}
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
   * Beendet eine aktive Wartesequenz.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {void}
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
   * Zeigt die ruhige Sitzhaltung vor der Atemschleife.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {void}
   */
  static showSeatedFrame(player) {
    player.stopWaitBreathing();
    if (player.texture.key === BULLDOG_TEXTURES.sit.key) return;
    player.anims.stop();
    player.setTexture(BULLDOG_TEXTURES.sit.key, 0);
  }
}
