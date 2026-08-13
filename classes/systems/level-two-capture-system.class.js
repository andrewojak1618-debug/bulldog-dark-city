import { DogCatcher } from "../entities/enemies/dog-catcher.class.js";
import {
  DOG_CATCHER,
  DOG_CATCHER_ANIMATION_KEYS,
  DOG_CATCHER_TEXTURES,
} from "../../js/config/dog-catcher-settings.js";
import { LEVEL_TWO } from "../../js/config/level-two-settings.js";
import { SCENES } from "../../js/config/game-settings.js";

/**
 * Manages level two capture system behavior.
 */
export class LevelTwoCaptureSystem {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   */
  constructor(scene) {
    this.scene = scene;
    this.dogCatcher = null;
    this.targetX = 0;
    this.isActive = false;
    this.hasFinished = false;
  }

  /**
   * Starts the current state.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {Phaser.Physics.Arcade.Sprite[]} cats - The cats value.
   * @returns {void} No value is returned.
   */
  start(player, cats) {
    if (this.isActive) return;
    this.isActive = true;
    this.stopCats(cats);
    this.createDogCatcher(player);
  }

  /**
   * Creates dog catcher.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  createDogCatcher(player) {
    const settings = LEVEL_TWO.captureSequence;
    const spawnX = this.getDogCatcherSpawnX(settings);
    this.targetX = player.x + settings.stopDistanceX;
    this.dogCatcher = new DogCatcher(
      this.scene,
      spawnX,
      player.y,
      DOG_CATCHER_TEXTURES.walk.key,
    );
    this.dogCatcher.setDepth(settings.depth);
    this.dogCatcher.setFlipX(true);
    this.alignFeetWithPlayer(player);
    this.dogCatcher.body.setAllowGravity(false);
  }

  /**
   * Returns dog catcher spawn x.
   * @param {object} settings - The configuration values to use.
   * @returns {number} The resulting numeric value.
   */
  getDogCatcherSpawnX(settings) {
    const halfWidth = DOG_CATCHER.displayWidth / 2;
    const cameraRight = this.scene.cameras.main.worldView.right;
    return Math.min(
      cameraRight + halfWidth - settings.visibleEdgeInsetX,
      LEVEL_TWO.world.width - halfWidth,
    );
  }

  /**
   * Updates the current state.
   * @returns {void} No value is returned.
   */
  update() {
    if (!this.isActive || this.hasFinished || !this.dogCatcher?.body) return;

    if (this.dogCatcher.x > this.targetX) {
      this.dogCatcher.setVelocityX(-LEVEL_TWO.captureSequence.approachSpeed);
      this.dogCatcher.play(DOG_CATCHER_ANIMATION_KEYS.walk, true);
      return;
    }

    this.showFinalAttackFrame();
  }

  /**
   * Shows final attack frame.
   * @returns {void} No value is returned.
   */
  showFinalAttackFrame() {
    this.hasFinished = true;
    this.dogCatcher.setVelocityX(0);
    this.dogCatcher.anims.stop();
    this.dogCatcher.setTexture(
      DOG_CATCHER_TEXTURES.attack.key,
      DOG_CATCHER_TEXTURES.attack.frameCount - 1,
    );
    this.scene.time.delayedCall(
      LEVEL_TWO.captureSequence.attackFrameDurationMs,
      () => this.scene.scene.start(SCENES.gameOver),
    );
  }

  /**
   * Stops cats.
   * @param {Phaser.Physics.Arcade.Sprite[]} cats - The cats value.
   * @returns {void} No value is returned.
   */
  stopCats(cats) {
    cats.forEach((cat) => {
      if (!cat?.body) return;
      cat.settleAfterKnockOut();
      cat.body.enable = false;
    });
  }

  /**
   * Handles align feet with player.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  alignFeetWithPlayer(player) {
    const playerFeetY = player.body?.bottom;
    const dogCatcherFeetY = this.dogCatcher.body?.bottom;
    if (!Number.isFinite(playerFeetY) || !Number.isFinite(dogCatcherFeetY)) {
      return;
    }
    this.dogCatcher.y += playerFeetY - dogCatcherFeetY;
  }
}
