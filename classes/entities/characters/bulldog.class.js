import Phaser from "phaser";
import { BULLDOG_GAMEPLAY } from
  "../../../js/config/bulldog-gameplay-settings.js";
import {
  BULLDOG_ANIMATION_KEYS,
  BULLDOG_ANIMATION_TIMING,
  BULLDOG_EVENTS,
  BULLDOG_TEXTURES,
} from "../../../js/config/bulldog-animation-settings.js";

/**
 * Bildet die steuerbare Bulldogge des technischen Prototyps ab.
 */
export class Bulldog extends Phaser.Physics.Arcade.Sprite {
  /**
   * Erstellt die Bulldogge mit einer angepassten Arcade-Physics-Hitbox.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {number} x - Horizontale Startposition.
   * @param {number} y - Vertikale Startposition.
   * @param {string} texture - Texturschlüssel des Testframes.
   */
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    const settings = BULLDOG_GAMEPLAY;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(
      settings.displayWidth,
      settings.displayHeight,
    );
    this.body
      .setSize(settings.bodyWidth, settings.bodyHeight)
      .setOffset(settings.bodyOffsetX, settings.bodyOffsetY);
    this.setCollideWorldBounds(true);
    this.setMaxVelocity(settings.moveSpeed, settings.maxFallSpeed);
    this.standingStartedAt = null;
    this.wasFalling = false;
    this.isLanding = false;
    this.isAttacking = false;
    this.biteHitConsumed = false;
    this.isHit = false;
    this.hitReactionEndsAt = 0;
    this.isKnockedOut = false;
  }

  /**
   * Wendet Bewegung und Sprung anhand der aktuellen Eingaben an.
   * @param {import("../../input/input-system.class.js").InputSystem} input - Spielereingaben.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  updateMovement(input, time) {
    if (this.isKnockedOut) return;
    if (this.updateActionState(input, time)) return;
    const direction = input.getHorizontalAxis();
    this.applyMovement(input, direction);
    this.updateMovementAnimations(direction);
  }

  /**
   * Behandelt Trefferreaktion und Biss, bevor Bewegung erlaubt wird.
   * @param {import("../../input/input-system.class.js").InputSystem} input - Spielereingaben.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {boolean} `true`, solange eine Aktion die Bewegung sperrt.
   */
  updateActionState(input, time) {
    if (this.isHit && time < this.hitReactionEndsAt) {
      this.setVelocityX(0);
      return true;
    }
    if (this.isHit) this.finishHitReaction();
    if (input.consumeAttack()) this.startBiteAttack();
    if (!this.isAttacking) return false;
    this.setVelocityX(0);
    return true;
  }

  /**
   * Überträgt Richtung, Schwerkraft und Sprungimpuls auf die Physik.
   * @param {import("../../input/input-system.class.js").InputSystem} input - Spielereingaben.
   * @param {-1|0|1} direction - Horizontale Bewegungsrichtung.
   * @returns {void}
   */
  applyMovement(input, direction) {
    const isFalling = this.body.velocity.y > 0;
    this.setVelocityX(direction * BULLDOG_GAMEPLAY.moveSpeed);
    this.setGravityY(isFalling ? BULLDOG_GAMEPLAY.fallGravityBoost : 0);
    if (direction !== 0) this.setFlipX(direction < 0);
    if (input.consumeJump() && this.isGrounded()) {
      this.setVelocityY(BULLDOG_GAMEPLAY.jumpVelocity);
    }
  }

  /**
   * Wählt anhand der Physik den passenden Sprung-, Fall- oder Bodenstatus.
   * @param {-1|0|1} direction - Horizontale Bewegungsrichtung.
   * @returns {void}
   */
  updateMovementAnimations(direction) {
    const isGrounded = this.isGrounded();
    const verticalVelocity = this.body.velocity.y;
    const isJumping = verticalVelocity < 0;
    const isAirborneFalling = verticalVelocity > 0 && !isGrounded;

    this.updateJumpAnimation(isJumping);
    this.updateFallAnimation(isAirborneFalling);
    const isLanding = this.updateLandingAnimation(
      isAirborneFalling,
      isGrounded,
    );

    if (isLanding) return this.resetStandingTimer();
    this.updateRunAnimation(direction, isGrounded);
    this.updateWaitAnimation(direction, isGrounded);
  }

  /** Setzt den Startzeitpunkt der Ruhephase zurück. @returns {void} */
  resetStandingTimer() {
    this.standingStartedAt = null;
  }

  /**
   * Startet die Bissattacke am Boden und sperrt Mehrfachauslösungen bis zum
   * letzten Frame.
   * @returns {boolean} `true`, wenn ein neuer Angriff gestartet wurde.
   */
  startBiteAttack() {
    if (this.isAttacking || this.isKnockedOut || !this.isGrounded()) {
      return false;
    }

    this.isAttacking = true;
    this.biteHitConsumed = false;
    this.standingStartedAt = null;
    this.setVelocityX(0);
    this.anims.stop();
    this.play(BULLDOG_ANIMATION_KEYS.biteAttack);
    this.once(
      this.getBiteCompleteEventName(),
      () => this.finishBiteAttack(),
    );
    return true;
  }

  /**
   * Liefert den Phaser-Ereignisnamen für das Ende der Bissanimation.
   * @returns {string} Vollständiger Animation-Complete-Ereignisname.
   */
  getBiteCompleteEventName() {
    return (
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
      BULLDOG_ANIMATION_KEYS.biteAttack
    );
  }

  /**
   * Meldet genau einen Biss-Treffer im letzten Angriffsframe.
   * @param {Phaser.Physics.Arcade.Sprite} target - Angegriffener Gegner.
   * @param {number} hitRange - Maximale horizontale Trefferentfernung.
   * @param {number} groundTolerance - Erlaubter Abstand der Fußpunkte.
   * @returns {boolean} `true`, wenn dieser Biss den Gegner neu trifft.
   */
  consumeBiteHit(target, hitRange, groundTolerance) {
    if (!this.isBiteImpactReady(target)) return false;
    const distanceX = target.x - this.x;
    if (!this.isTargetInBiteRange(target, distanceX, hitRange, groundTolerance)) return false;
    this.biteHitConsumed = true;
    return true;
  }

  /**
   * Prüft Angriffsstatus, Zielzustand und aktiven Trefferframe.
   * @param {Phaser.Physics.Arcade.Sprite} target - Angegriffener Gegner.
   * @returns {boolean} `true`, wenn eine Trefferprüfung sinnvoll ist.
   */
  isBiteImpactReady(target) {
    const impactFrame = BULLDOG_TEXTURES.biteAttack.frameCount - 1;
    return this.isAttacking &&
      !this.biteHitConsumed &&
      Boolean(target?.active && target.body?.enable) &&
      this.anims.currentAnim?.key === BULLDOG_ANIMATION_KEYS.biteAttack &&
      this.anims.currentFrame?.textureFrame === impactFrame;
  }

  /**
   * Prüft Blickrichtung, Reichweite und gemeinsamen Boden des Bissziels.
   * @param {Phaser.Physics.Arcade.Sprite} target - Angegriffener Gegner.
   * @param {number} distanceX - Horizontaler Abstand zum Ziel.
   * @param {number} hitRange - Maximale horizontale Trefferentfernung.
   * @param {number} groundTolerance - Erlaubter Abstand der Fußpunkte.
   * @returns {boolean} `true`, wenn das Ziel getroffen werden darf.
   */
  isTargetInBiteRange(target, distanceX, hitRange, groundTolerance) {
    const facingDirection = this.flipX ? -1 : 1;
    const feetDistance = Math.abs(this.body.bottom - target.body.bottom);
    return distanceX * facingDirection >= 0 &&
      Math.abs(distanceX) <= hitRange &&
      feetDistance <= groundTolerance;
  }

  /**
   * Beendet den Bisszustand und stellt die neutrale Haltung wieder her.
   * @returns {void}
   */
  finishBiteAttack() {
    if (!this.isAttacking) return;

    this.isAttacking = false;
    this.biteHitConsumed = false;
    this.showStandFrame();
  }

  /**
   * Zeigt nach einem normalen Gegnertreffer kurz den ersten K.-o.-Frame.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {boolean} `true`, wenn die Trefferreaktion gestartet wurde.
   */
  takeHit(time) {
    if (this.isKnockedOut || this.isHit) return false;

    this.isHit = true;
    this.hitReactionEndsAt = time + BULLDOG_ANIMATION_TIMING.hitReactionMs;
    this.standingStartedAt = null;
    this.isLanding = false;
    this.isAttacking = false;
    this.biteHitConsumed = false;
    this.off(this.getBiteCompleteEventName());
    this.setVelocityX(0);
    this.anims.stop();
    this.setTexture(BULLDOG_TEXTURES.knockout.key, 0);
    return true;
  }

  /**
   * Beendet die kurze Trefferreaktion und stellt den Standframe wieder her.
   * @returns {void}
   */
  finishHitReaction() {
    if (!this.isHit) return;

    this.isHit = false;
    this.showStandFrame();
  }

  /**
   * Sperrt die Steuerung und spielt die K.-o.-Sequenz genau einmal ab.
   * @returns {boolean} `true`, wenn der K.-o.-Zustand neu ausgelöst wurde.
   */
  knockOut() {
    if (this.isKnockedOut) return false;

    this.isKnockedOut = true;
    this.standingStartedAt = null;
    this.isLanding = false;
    this.isAttacking = false;
    this.biteHitConsumed = false;
    this.isHit = false;
    this.off(this.getBiteCompleteEventName());
    this.setVelocity(0, 0);
    this.setGravityY(0);
    this.anims.stop();
    this.play(BULLDOG_ANIMATION_KEYS.knockout);
    this.emit(BULLDOG_EVENTS.knockedOut);
    return true;
  }

  /**
   * Registriert eine einmalige Aktion nach dem letzten K.-o.-Frame.
   * @param {Function} callback - Aktion nach Abschluss der Animation.
   * @returns {void}
   */
  onceKnockOutComplete(callback) {
    const eventName =
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
      BULLDOG_ANIMATION_KEYS.knockout;
    this.once(eventName, callback);
  }

  /**
   * Spielt die Sprunganimation während der Aufwärtsbewegung ab.
   * @param {boolean} isJumping - Ob sich die Bulldogge aufwärts bewegt.
   * @returns {void}
   */
  updateJumpAnimation(isJumping) {
    if (isJumping) {
      this.play(BULLDOG_ANIMATION_KEYS.jump, true);
      return;
    }

    if (this.anims.currentAnim?.key === BULLDOG_ANIMATION_KEYS.jump) {
      this.anims.stop();
      this.showStandFrame();
    }
  }

  /**
   * Spielt die Fallanimation während der Abwärtsbewegung ab.
   * @param {boolean} isFalling - Ob die Bulldogge frei abwärts fällt.
   * @returns {void}
   */
  updateFallAnimation(isFalling) {
    if (isFalling) {
      this.play(BULLDOG_ANIMATION_KEYS.fall, true);
      return;
    }

    if (this.anims.currentAnim?.key === BULLDOG_ANIMATION_KEYS.fall) {
      this.anims.stop();
      this.showStandFrame();
    }
  }

  /**
   * Spielt die Landesequenz einmal nach einer echten Fallbewegung ab.
   * @param {boolean} isFalling - Ob die Bulldogge frei abwärts fällt.
   * @param {boolean} isGrounded - Ob eine Kollisionsfläche berührt wird.
   * @returns {boolean} `true`, solange die Landesequenz aktiv ist.
   */
  updateLandingAnimation(isFalling, isGrounded) {
    const hasJustLanded = this.wasFalling && isGrounded;
    this.wasFalling = isFalling;

    if (hasJustLanded && !this.isLanding) {
      this.isLanding = true;
      this.play(BULLDOG_ANIMATION_KEYS.land);
    }

    if (!this.isLanding) {
      return false;
    }

    const isLandAnimationPlaying =
      this.anims.currentAnim?.key === BULLDOG_ANIMATION_KEYS.land &&
      this.anims.isPlaying;

    if (isLandAnimationPlaying) {
      return true;
    }

    this.isLanding = false;
    this.showStandFrame();
    return false;
  }

  /**
   * Spielt die Laufanimation nur während Bodenbewegung ab.
   * @param {number} direction - Aktuelle horizontale Bewegungsrichtung.
   * @param {boolean} isGrounded - Ob eine Kollisionsfläche berührt wird.
   * @returns {void}
   */
  updateRunAnimation(direction, isGrounded) {
    const isRunning =
      direction !== 0 &&
      this.body.velocity.y === 0 &&
      isGrounded;

    if (isRunning) {
      this.play(BULLDOG_ANIMATION_KEYS.run, true);
      return;
    }

    if (this.anims.currentAnim?.key === BULLDOG_ANIMATION_KEYS.run) {
      this.anims.stop();
      this.showStandFrame();
    }
  }

  /**
   * Spielt die Wartesequenz nach ausreichend langer Ruhe am Boden ab.
   * @param {number} direction - Aktuelle horizontale Bewegungsrichtung.
   * @param {boolean} isGrounded - Ob eine Kollisionsfläche berührt wird.
   * @returns {void}
   */
  updateWaitAnimation(direction, isGrounded) {
    const isStanding =
      direction === 0 &&
      this.body.velocity.y === 0 &&
      isGrounded;

    if (isStanding) {
      this.standingStartedAt ??= this.scene.time.now;
      const standingDuration =
        this.scene.time.now - this.standingStartedAt;

      if (standingDuration < BULLDOG_ANIMATION_TIMING.waitDelayMs) {
        return;
      }

      const seatedDuration =
        standingDuration - BULLDOG_ANIMATION_TIMING.waitDelayMs;

      if (seatedDuration < BULLDOG_ANIMATION_TIMING.waitSeatedPauseMs) {
        this.showSeatedFrame();
      } else {
        this.play(BULLDOG_ANIMATION_KEYS.waitBreathe, true);
      }
      return;
    }

    this.standingStartedAt = null;
    this.stopWaitAnimation();
  }

  /**
   * Stoppt die Wartesequenz und stellt den neutralen Frame wieder her.
   * @returns {void}
   */
  stopWaitAnimation() {
    const isWaitSequence =
      this.texture.key === BULLDOG_TEXTURES.sit.key ||
      this.texture.key === BULLDOG_TEXTURES.waitBreathe.key;

    if (isWaitSequence) {
      this.anims.stop();
      this.showStandFrame();
    }
  }

  /**
   * Zeigt die erste ruhige Sitzhaltung vor der Atemschleife.
   * @returns {void}
   */
  showSeatedFrame() {
    if (this.texture.key !== BULLDOG_TEXTURES.sit.key) {
      this.anims.stop();
      this.setTexture(BULLDOG_TEXTURES.sit.key, 0);
    }
  }

  /**
   * Stellt den neutralen Standframe ohne laufende Animation dar.
   * @returns {void}
   */
  showStandFrame() {
    this.setTexture(BULLDOG_TEXTURES.stand.key, 0);
  }

  /**
   * Prüft, ob die Bulldogge auf einer Kollisionsfläche steht.
   * @returns {boolean} `true`, wenn ein Sprung erlaubt ist.
   */
  isGrounded() {
    return this.body.blocked.down || this.body.touching.down;
  }
}
