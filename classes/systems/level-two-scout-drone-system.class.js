/**
 * Manages level two scout drone system behavior.
 */
export class LevelTwoScoutDroneSystem {
  /**
   * Updates the current state.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  static update(sprite, delta) {
    const drone = sprite.getData("drone");
    if (!drone.scoutApproach || this.updatePause(sprite, delta)) return;
    if (this.moveToCurrentStep(sprite, drone, delta)) {
      this.advanceStep(sprite, drone);
    }
  }

  /**
   * Updates pause.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {boolean} Whether the requested condition is met.
   */
  static updatePause(sprite, delta) {
    const remaining = Math.max(
      0,
      sprite.getData("scoutPauseRemaining") - delta,
    );
    sprite.setData("scoutPauseRemaining", remaining);
    return remaining > 0;
  }

  /**
   * Moves to current step.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {object} drone - The drone value.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {boolean} Whether the requested condition is met.
   */
  static moveToCurrentStep(sprite, drone, delta) {
    const step = sprite.getData("scoutStep");
    const targetY = drone.y + step * drone.scoutStepDistance;
    const movement = drone.scoutVerticalSpeed * delta / 1_000;
    const distance = targetY - sprite.y;
    sprite.y = Math.abs(distance) <= movement
      ? targetY
      : sprite.y + Math.sign(distance) * movement;
    return sprite.y === targetY;
  }

  /**
   * Handles advance step.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {object} drone - The drone value.
   * @returns {void} No value is returned.
   */
  static advanceStep(sprite, drone) {
    const step = sprite.getData("scoutStep");
    let direction = sprite.getData("scoutDirection");
    if (step >= drone.scoutStepCount) direction = -1;
    if (step <= 0) direction = 1;
    sprite.setData("scoutDirection", direction);
    sprite.setData("scoutStep", step + direction);
    sprite.setData("scoutPauseRemaining", drone.scoutStepPauseMs);
  }
}
