import Phaser from "phaser";
import { TEST_LEVEL } from "../../../js/config/test-level-settings.js";

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
  }

  /**
   * Prüft, ob die Bulldogge auf einer Kollisionsfläche steht.
   * @returns {boolean} `true`, wenn ein Sprung erlaubt ist.
   */
  isGrounded() {
    return this.body.blocked.down || this.body.touching.down;
  }
}
