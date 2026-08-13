import {
  ROBOT_CAT,
  ROBOT_CAT_FLIGHT_TEXTURE,
  ROBOT_CAT_STATES,
  ROBOT_CAT_WALK_TEXTURE,
} from "../../js/config/robot-cat-settings.js";
import { RobotCatAudioSystem } from
  "./robot-cat-audio-system.class.js";
import { RobotCatCollisionSystem } from
  "./robot-cat-collision-system.class.js";

/**
 * Manages robot cat flight system behavior.
 */
export class RobotCatFlightSystem {
  /**
   * Starts the current state.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {{id: string, x: number}} obstacle - The obstacle value.
   * @returns {void} No value is returned.
   */
  static begin(robotCat, obstacle) {
    this.setMovementState(robotCat, ROBOT_CAT_STATES.takingOff);
    robotCat.setData("activeObstacleX", obstacle.x);
    robotCat.setData("lastObstacleId", obstacle.id);
    robotCat.setData("lastObstacleX", obstacle.x);
    robotCat.play(ROBOT_CAT_FLIGHT_TEXTURE.takeoffAnimationKey, true)
      .setDisplaySize(ROBOT_CAT.flightDisplaySize, ROBOT_CAT.flightDisplaySize);
    RobotCatAudioSystem.playThrustFlight(robotCat);
    RobotCatCollisionSystem.setEnabled(robotCat, false);
  }

  /**
   * Updates the current state.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  static update(robotCat, delta) {
    const state = robotCat.getData("movementState");
    if (state === ROBOT_CAT_STATES.takingOff) this.updateTakeoff(robotCat, delta);
    if (state === ROBOT_CAT_STATES.flying) this.updateFlight(robotCat, delta);
    if (state === ROBOT_CAT_STATES.landing) this.updateLanding(robotCat, delta);
  }

  /**
   * Updates takeoff.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  static updateTakeoff(robotCat, delta) {
    const elapsed = this.advanceStateTime(robotCat, delta);
    this.setFlightHeight(robotCat, this.getTakeoffProgress(elapsed));
    if (elapsed < ROBOT_CAT.takeoffDuration) return;
    this.setMovementState(robotCat, ROBOT_CAT_STATES.flying);
    robotCat.setTexture(ROBOT_CAT_FLIGHT_TEXTURE.key, 2);
  }

  /**
   * Returns takeoff progress.
   * @param {number} elapsed - The elapsed value.
   * @returns {number} The resulting numeric value.
   */
  static getTakeoffProgress(elapsed) {
    const contactDuration = ROBOT_CAT.takeoffDuration /
      ROBOT_CAT_FLIGHT_TEXTURE.frameCount;
    const airborneElapsed = Math.max(0, elapsed - contactDuration);
    const airborneDuration = ROBOT_CAT.takeoffDuration - contactDuration;
    return this.smoothStep(airborneElapsed / airborneDuration);
  }

  /**
   * Updates flight.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  static updateFlight(robotCat, delta) {
    const direction = robotCat.getData("direction") ?? -1;
    const obstacleX = robotCat.getData("activeObstacleX");
    robotCat.x += direction * ROBOT_CAT.flightSpeed * delta / 1_000;
    const distance = (robotCat.x - obstacleX) * direction;
    if (distance >= ROBOT_CAT.obstacleClearDistance) this.beginLanding(robotCat);
  }

  /**
   * Starts landing.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @returns {void} No value is returned.
   */
  static beginLanding(robotCat) {
    const texture = ROBOT_CAT_FLIGHT_TEXTURE;
    this.setMovementState(robotCat, ROBOT_CAT_STATES.landing);
    robotCat.setTexture(texture.key, texture.landingSequence[0]);
  }

  /**
   * Updates landing.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  static updateLanding(robotCat, delta) {
    const elapsed = this.advanceStateTime(robotCat, delta);
    this.updateLandingFrame(robotCat, elapsed);
    this.setFlightHeight(robotCat, 1 - this.getLandingProgress(elapsed));
    this.fadeThrustBeforeGroundContact(robotCat, elapsed);
    if (elapsed >= this.getLandingDuration()) this.finishLanding(robotCat);
  }

  /**
   * Fades thrust before ground contact.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {number} elapsed - The elapsed value.
   * @returns {void} No value is returned.
   */
  static fadeThrustBeforeGroundContact(robotCat, elapsed) {
    const fadeDuration = ROBOT_CAT.thrustFadeBeforeGroundMs;
    const fadeStart = this.getLandingAirborneDuration() - fadeDuration;
    if (elapsed < fadeStart) return;
    RobotCatAudioSystem.fadeOutThrustFlight(robotCat, fadeDuration);
  }

  /**
   * Returns landing progress.
   * @param {number} elapsed - The elapsed value.
   * @returns {number} The resulting numeric value.
   */
  static getLandingProgress(elapsed) {
    return this.smoothStep(elapsed / this.getLandingAirborneDuration());
  }

  /**
   * Returns landing airborne duration.
   * @returns {number} The resulting numeric value.
   */
  static getLandingAirborneDuration() {
    return ROBOT_CAT_FLIGHT_TEXTURE.landingFrameDurations
      .slice(0, -1)
      .reduce((total, duration) => total + duration, 0);
  }

  /**
   * Returns landing duration.
   * @returns {number} The resulting numeric value.
   */
  static getLandingDuration() {
    return ROBOT_CAT_FLIGHT_TEXTURE.landingFrameDurations
      .reduce((total, duration) => total + duration, 0);
  }

  /**
   * Updates landing frame.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {number} elapsed - The elapsed value.
   * @returns {void} No value is returned.
   */
  static updateLandingFrame(robotCat, elapsed) {
    const texture = ROBOT_CAT_FLIGHT_TEXTURE;
    let frameEnd = 0;
    for (let index = 0; index < texture.landingSequence.length; index += 1) {
      frameEnd += texture.landingFrameDurations[index];
      if (elapsed >= frameEnd) continue;
      robotCat.setFrame(texture.landingSequence[index]);
      return;
    }
    robotCat.setFrame(texture.landingSequence.at(-1));
  }

  /**
   * Completes landing.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @returns {void} No value is returned.
   */
  static finishLanding(robotCat) {
    RobotCatAudioSystem.stopThrustFlight(robotCat);
    robotCat.setY(robotCat.getData("groundY"))
      .play(ROBOT_CAT_WALK_TEXTURE.animationKey, true)
      .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight);
    this.setMovementState(robotCat, ROBOT_CAT_STATES.walking);
    robotCat.setData("activeObstacleX", null);
    RobotCatCollisionSystem.setEnabled(robotCat, true);
    RobotCatCollisionSystem.sync(robotCat);
  }

  /**
   * Sets movement state.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {string} state - The state value to apply.
   * @returns {void} No value is returned.
   */
  static setMovementState(robotCat, state) {
    robotCat.setData("movementState", state);
    robotCat.setData("stateElapsed", 0);
  }

  /**
   * Sets flight height.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {number} progress - The progress value.
   * @returns {void} No value is returned.
   */
  static setFlightHeight(robotCat, progress) {
    const groundY = robotCat.getData("groundY");
    robotCat.setY(groundY - ROBOT_CAT.flightHeight * progress);
  }

  /**
   * Handles smooth step.
   * @param {number} value - The value to process.
   * @returns {number} The resulting numeric value.
   */
  static smoothStep(value) {
    const progress = Math.min(1, Math.max(0, value));
    return progress * progress * (3 - 2 * progress);
  }

  /**
   * Handles advance state time.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {number} The resulting numeric value.
   */
  static advanceStateTime(robotCat, delta) {
    const elapsed = (robotCat.getData("stateElapsed") ?? 0) + delta;
    robotCat.setData("stateElapsed", elapsed);
    return elapsed;
  }
}
