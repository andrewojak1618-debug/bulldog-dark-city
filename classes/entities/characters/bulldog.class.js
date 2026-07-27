import Phaser from "phaser";
import { TEST_LEVEL } from "../../../js/config/test-level-settings.js";
import {
  BULLDOG_ANIMATION_KEYS,
  BULLDOG_ANIMATION_TIMING,
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
    const settings = TEST_LEVEL.player;
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
  }

  /**
   * Wendet Bewegung und Sprung anhand der aktuellen Eingaben an.
   * @param {import("../../input/input-system.class.js").InputSystem} input - Spielereingaben.
   * @returns {void}
   */
  updateMovement(input) {
    const direction = input.getHorizontalAxis();
    const isFalling = this.body.velocity.y > 0;
    this.setVelocityX(direction * TEST_LEVEL.player.moveSpeed);
    this.setGravityY(
      isFalling ? TEST_LEVEL.player.fallGravityBoost : 0,
    );

    if (direction !== 0) {
      this.setFlipX(direction < 0);
    }

    if (input.consumeJump() && this.isGrounded()) {
      this.setVelocityY(TEST_LEVEL.player.jumpVelocity);
    }

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

    if (isLanding) {
      this.standingStartedAt = null;
      return;
    }

    this.updateRunAnimation(direction, isGrounded);
    this.updateWaitAnimation(direction, isGrounded);
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
