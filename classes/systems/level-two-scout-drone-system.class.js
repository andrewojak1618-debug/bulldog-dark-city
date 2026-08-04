/** Steuert ausschließlich die stufenweise Bewegung der Aufklärungsdrohne. */
export class LevelTwoScoutDroneSystem {
  /**
   * Aktualisiert Pause, vertikale Bewegung und nächsten Bewegungsschritt.
   * @param {Phaser.GameObjects.Sprite} sprite - Alarmierte Drohne.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  static update(sprite, delta) {
    const drone = sprite.getData("drone");
    if (!drone.scoutApproach || this.updatePause(sprite, delta)) return;
    if (this.moveToCurrentStep(sprite, drone, delta)) {
      this.advanceStep(sprite, drone);
    }
  }

  /**
   * Reduziert die Pause zwischen zwei sichtbaren Stufen.
   * @param {Phaser.GameObjects.Sprite} sprite - Aufklärungsdrohne.
   * @param {number} delta - Vergangene Zeit in Millisekunden.
   * @returns {boolean} `true`, solange die Pause noch läuft.
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
   * Bewegt die Drohne ohne Überschwingen zur aktuellen Stufe.
   * @param {Phaser.GameObjects.Sprite} sprite - Aufklärungsdrohne.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @param {number} delta - Vergangene Zeit in Millisekunden.
   * @returns {boolean} `true`, wenn die Stufe erreicht wurde.
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
   * Kehrt an den Endpunkten um und legt die nächste Stufe fest.
   * @param {Phaser.GameObjects.Sprite} sprite - Aufklärungsdrohne.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {void}
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
