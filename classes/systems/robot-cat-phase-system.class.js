import { ROBOT_CAT_PHASES } from
  "../../js/config/robot-cat-settings.js";

/**
 * Synchronizes robot cat combat phases with the segmented boss health bar.
 */
export class RobotCatPhaseSystem {
  /**
   * Attaches phase progression to the boss health value.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {import("./health-system.class.js").HealthSystem} health - The boss health system.
   * @returns {RobotCatPhaseSystem} The created instance.
   */
  static attach(robotCat, health) {
    return new RobotCatPhaseSystem(robotCat, health);
  }

  /**
   * Creates a new instance.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {import("./health-system.class.js").HealthSystem} health - The boss health system.
   */
  constructor(robotCat, health) {
    this.robotCat = robotCat;
    this.currentPhase = 0;
    const unsubscribe = health.onChange((current, maximum) => {
      this.applyHealth(current, maximum);
    });
    robotCat.once("destroy", unsubscribe);
  }

  /**
   * Applies the phase belonging to the current health value.
   * @param {number} current - The current boss health.
   * @param {number} maximum - The maximum boss health.
   * @returns {void} No value is returned.
   */
  applyHealth(current, maximum) {
    const phase = RobotCatPhaseSystem.getPhase(current, maximum);
    const isNewPhase = phase > this.currentPhase && current > 0;
    this.currentPhase = phase;
    this.robotCat.setData("combatPhase", phase);
    if (isNewPhase) this.robotCat.setData("phaseAttackPending", true);
    if (this.robotCat.getData("phaseAttackPending") === undefined) {
      this.robotCat.setData("phaseAttackPending", false);
    }
    this.robotCat.setData(
      "speedMultiplier",
      ROBOT_CAT_PHASES[phase].patrolSpeedMultiplier,
    );
  }

  /**
   * Returns the phase index for a segmented health value.
   * @param {number} current - The current boss health.
   * @param {number} maximum - The maximum boss health.
   * @returns {number} The zero-based combat phase.
   */
  static getPhase(current, maximum) {
    const healthPerPhase = maximum / ROBOT_CAT_PHASES.length;
    const phase = Math.floor((maximum - current) / healthPerPhase);
    return Math.min(ROBOT_CAT_PHASES.length - 1, Math.max(0, phase));
  }

  /**
   * Returns settings for the robot cat's active combat phase.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @returns {object} The phase configuration.
   */
  static getSettings(robotCat) {
    const phase = robotCat?.getData?.("combatPhase") ?? 0;
    return ROBOT_CAT_PHASES[phase] ?? ROBOT_CAT_PHASES[0];
  }
}
