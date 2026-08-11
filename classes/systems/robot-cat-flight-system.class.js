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

/** Steuert Abheben, Hindernisüberflug und Landung der Roboterkatze. */
export class RobotCatFlightSystem {
  /**
   * Startet die Abhebephase und deaktiviert die bodennahe Blockierfläche.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {{id: string, x: number}} obstacle - Aktives Hindernis.
   * @returns {void}
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
   * Aktualisiert den gerade aktiven Flugzustand.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  static update(robotCat, delta) {
    const state = robotCat.getData("movementState");
    if (state === ROBOT_CAT_STATES.takingOff) this.updateTakeoff(robotCat, delta);
    if (state === ROBOT_CAT_STATES.flying) this.updateFlight(robotCat, delta);
    if (state === ROBOT_CAT_STATES.landing) this.updateLanding(robotCat, delta);
  }

  /**
   * Hebt die Roboterkatze während ihrer Startanimation weich an.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  static updateTakeoff(robotCat, delta) {
    const elapsed = this.advanceStateTime(robotCat, delta);
    this.setFlightHeight(robotCat, this.getTakeoffProgress(elapsed));
    if (elapsed < ROBOT_CAT.takeoffDuration) return;
    this.setMovementState(robotCat, ROBOT_CAT_STATES.flying);
    robotCat.setTexture(ROBOT_CAT_FLIGHT_TEXTURE.key, 2);
  }

  /**
   * Berechnet die weich beschleunigte Höhe nach der Bodenhaftungsphase.
   * @param {number} elapsed - Vergangene Zeit der Abhebephase.
   * @returns {number} Fortschritt zwischen 0 und 1.
   */
  static getTakeoffProgress(elapsed) {
    const contactDuration = ROBOT_CAT.takeoffDuration /
      ROBOT_CAT_FLIGHT_TEXTURE.frameCount;
    const airborneElapsed = Math.max(0, elapsed - contactDuration);
    const airborneDuration = ROBOT_CAT.takeoffDuration - contactDuration;
    return this.smoothStep(airborneElapsed / airborneDuration);
  }

  /**
   * Bewegt die Roboterkatze bis hinter das aktive Hindernis.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame.
   * @returns {void}
   */
  static updateFlight(robotCat, delta) {
    const direction = robotCat.getData("direction") ?? -1;
    const obstacleX = robotCat.getData("activeObstacleX");
    robotCat.x += direction * ROBOT_CAT.flightSpeed * delta / 1_000;
    const distance = (robotCat.x - obstacleX) * direction;
    if (distance >= ROBOT_CAT.obstacleClearDistance) this.beginLanding(robotCat);
  }

  /**
   * Startet die manuell getaktete Landephase.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @returns {void}
   */
  static beginLanding(robotCat) {
    const texture = ROBOT_CAT_FLIGHT_TEXTURE;
    this.setMovementState(robotCat, ROBOT_CAT_STATES.landing);
    robotCat.setTexture(texture.key, texture.landingSequence[0]);
  }

  /**
   * Senkt die Roboterkatze ab und schließt die Landung ab.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame.
   * @returns {void}
   */
  static updateLanding(robotCat, delta) {
    const elapsed = this.advanceStateTime(robotCat, delta);
    this.updateLandingFrame(robotCat, elapsed);
    this.setFlightHeight(robotCat, 1 - this.getLandingProgress(elapsed));
    this.fadeThrustBeforeGroundContact(robotCat, elapsed);
    if (elapsed >= this.getLandingDuration()) this.finishLanding(robotCat);
  }

  /**
   * Startet die Audioausblendung kurz vor dem Bodenkontakt.
   * @param {Phaser.GameObjects.Sprite} robotCat - Landende Roboterkatze.
   * @param {number} elapsed - Vergangene Landezeit.
   * @returns {void}
   */
  static fadeThrustBeforeGroundContact(robotCat, elapsed) {
    const fadeDuration = ROBOT_CAT.thrustFadeBeforeGroundMs;
    const fadeStart = this.getLandingAirborneDuration() - fadeDuration;
    if (elapsed < fadeStart) return;
    RobotCatAudioSystem.fadeOutThrustFlight(robotCat, fadeDuration);
  }

  /**
   * Berechnet die weiche Abwärtsbewegung bis zum Bodenkontakt.
   * @param {number} elapsed - Vergangene Landezeit.
   * @returns {number} Fortschritt zwischen 0 und 1.
   */
  static getLandingProgress(elapsed) {
    return this.smoothStep(elapsed / this.getLandingAirborneDuration());
  }

  /** @returns {number} Zeit bis zum ersten sichtbaren Bodenkontakt. */
  static getLandingAirborneDuration() {
    return ROBOT_CAT_FLIGHT_TEXTURE.landingFrameDurations
      .slice(0, -1)
      .reduce((total, duration) => total + duration, 0);
  }

  /** @returns {number} Gesamtdauer der Landeanimation. */
  static getLandingDuration() {
    return ROBOT_CAT_FLIGHT_TEXTURE.landingFrameDurations
      .reduce((total, duration) => total + duration, 0);
  }

  /**
   * Wählt den Lande-Frame anhand seiner individuellen Haltedauer.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} elapsed - Vergangene Landezeit.
   * @returns {void}
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
   * Wechselt nach der Landung zurück in den Bodenzustand.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @returns {void}
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
   * Setzt Zustand und zustandsbezogene Laufzeit gemeinsam zurück.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {string} state - Neuer Bewegungszustand.
   * @returns {void}
   */
  static setMovementState(robotCat, state) {
    robotCat.setData("movementState", state);
    robotCat.setData("stateElapsed", 0);
  }

  /**
   * Richtet die vertikale Position am Flugfortschritt aus.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} progress - Flugfortschritt zwischen 0 und 1.
   * @returns {void}
   */
  static setFlightHeight(robotCat, progress) {
    const groundY = robotCat.getData("groundY");
    robotCat.setY(groundY - ROBOT_CAT.flightHeight * progress);
  }

  /**
   * Begrenzt und glättet einen linearen Fortschrittswert.
   * @param {number} value - Linearer Fortschrittswert.
   * @returns {number} Begrenzter und geglätteter Fortschritt.
   */
  static smoothStep(value) {
    const progress = Math.min(1, Math.max(0, value));
    return progress * progress * (3 - 2 * progress);
  }

  /**
   * Erhöht den Zeitzähler des aktuellen Bewegungszustands.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame.
   * @returns {number} Aktualisierte Zustandszeit.
   */
  static advanceStateTime(robotCat, delta) {
    const elapsed = (robotCat.getData("stateElapsed") ?? 0) + delta;
    robotCat.setData("stateElapsed", elapsed);
    return elapsed;
  }
}
