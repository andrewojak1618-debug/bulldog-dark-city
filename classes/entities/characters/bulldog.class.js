import Phaser from "phaser";
import { TEST_LEVEL } from "../../../js/config/test-level-settings.js";
import {
  BULLDOG_ANIMATION_KEYS,
  BULLDOG_ANIMATION_TIMING,
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
    this.idleStartedAt = null;
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

    this.updateIdleAnimation(direction);
  }

  /**
   * Spielt Idle nach ausreichend langer Ruhe am Boden ab.
   * @param {number} direction - Aktuelle horizontale Bewegungsrichtung.
   * @returns {void}
   */
  updateIdleAnimation(direction) {
    const isStanding =
      direction === 0 &&
      this.body.velocity.y === 0 &&
      this.isGrounded();

    if (isStanding) {
      this.idleStartedAt ??= this.scene.time.now;
      const idleDuration = this.scene.time.now - this.idleStartedAt;

      if (idleDuration < BULLDOG_ANIMATION_TIMING.idleDelayMs) {
        return;
      }

      const cycleDuration =
        BULLDOG_ANIMATION_TIMING.idleActiveDurationMs +
        BULLDOG_ANIMATION_TIMING.idlePauseDurationMs;
      const cycleElapsed =
        (idleDuration - BULLDOG_ANIMATION_TIMING.idleDelayMs) %
        cycleDuration;

      if (cycleElapsed < BULLDOG_ANIMATION_TIMING.idleActiveDurationMs) {
        this.play(BULLDOG_ANIMATION_KEYS.idle, true);
      } else {
        this.stopIdleAnimation();
      }
      return;
    }

    this.idleStartedAt = null;
    this.stopIdleAnimation();
  }

  /**
   * Stoppt Idle und stellt den neutralen Ausgangsframe wieder her.
   * @returns {void}
   */
  stopIdleAnimation() {
    if (this.anims.currentAnim?.key === BULLDOG_ANIMATION_KEYS.idle) {
      this.anims.stop();
      this.setFrame(0);
    }
  }

  /**
   * Prüft, ob die Bulldogge auf einer Kollisionsfläche steht.
   * @returns {boolean} `true`, wenn ein Sprung erlaubt ist.
   */
  isGrounded() {
    return this.body.blocked.down || this.body.touching.down;
  }
}
