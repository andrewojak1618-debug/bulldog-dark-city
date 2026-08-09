import Phaser from "phaser";
import { BULLDOG_ATTACK_TEXTURES } from
  "../../js/config/bulldog-animation-settings.js";
import {
  ROBOT_CAT,
  ROBOT_CAT_COMBAT,
  ROBOT_CAT_DEAD_TEXTURE,
  ROBOT_CAT_FLIGHT_TEXTURE,
  ROBOT_CAT_HIT_TEXTURE,
  ROBOT_CAT_STATES,
  ROBOT_CAT_WALK_TEXTURE,
} from "../../js/config/robot-cat-settings.js";

/** Verarbeitet Bulldoggen-Treffer und den Lebenszustand der Roboterkatze. */
export class RobotCatCombatSystem {
  /**
   * Prüft pro Frame, ob der aktive Bulldoggen-Angriff den Boss trifft.
   * @param {Phaser.GameObjects.Sprite} robotCat - Angegriffene Roboterkatze.
   * @param {Phaser.Physics.Arcade.Sprite} player - Angreifende Bulldogge.
   * @param {import("./health-system.class.js").HealthSystem} health - Bossleben.
   * @returns {boolean} Ob in diesem Frame Schaden verursacht wurde.
   */
  static update(robotCat, player, health) {
    if (!this.isImpactFrameReady(robotCat, player, health)) return false;
    if (!this.isTargetInRange(robotCat, player)) return false;
    player.attackHitConsumed = true;
    return this.applyDamage(
      robotCat,
      health,
      ROBOT_CAT_COMBAT.damagePerHit,
    );
  }

  /**
   * Wendet Nahkampf- oder Projektilschaden einheitlich auf den Boss an.
   * @param {Phaser.GameObjects.Sprite} robotCat - Getroffene Roboterkatze.
   * @param {import("./health-system.class.js").HealthSystem} health - Bossleben.
   * @param {number} damage - Abzuziehende Lebenspunkte.
   * @returns {boolean} Ob der Schaden übernommen wurde.
   */
  static applyDamage(robotCat, health, damage) {
    if (!robotCat?.active || health.getCurrent() <= 0) return false;
    const remaining = health.takeDamage(damage);
    if (remaining === 0) {
      this.defeat(robotCat);
    } else {
      this.showHitFeedback(robotCat);
    }
    return true;
  }

  /**
   * Prüft Angriff, Trefferframe sowie den aktiven Lebenszustand des Bosses.
   * @param {Phaser.GameObjects.Sprite} robotCat - Angegriffene Roboterkatze.
   * @param {Phaser.Physics.Arcade.Sprite} player - Angreifende Bulldogge.
   * @param {import("./health-system.class.js").HealthSystem} health - Bossleben.
   * @returns {boolean} Ob der aktuelle Angriffsframe treffen darf.
   */
  static isImpactFrameReady(robotCat, player, health) {
    if (!robotCat?.active || health.getCurrent() <= 0 ||
        !player?.isAttacking || player.attackHitConsumed) return false;
    const animationKey = player.anims.currentAnim?.key;
    const texture = BULLDOG_ATTACK_TEXTURES[animationKey];
    return Boolean(
      texture &&
      player.anims.currentFrame?.textureFrame === texture.frameCount - 1,
    );
  }

  /**
   * Prüft Blickrichtung sowie horizontale und vertikale Schlagreichweite.
   * @param {Phaser.GameObjects.Sprite} robotCat - Angegriffene Roboterkatze.
   * @param {Phaser.Physics.Arcade.Sprite} player - Angreifende Bulldogge.
   * @returns {boolean} Ob der Boss innerhalb der Schlagreichweite steht.
   */
  static isTargetInRange(robotCat, player) {
    const direction = player.flipX ? -1 : 1;
    const distanceX = robotCat.x - player.x;
    const playerFeetY = player.body?.bottom ?? player.y;
    return (
      distanceX * direction >= 0 &&
      Math.abs(distanceX) <= ROBOT_CAT_COMBAT.attackHitRangeX &&
      Math.abs(robotCat.y - playerFeetY) <= ROBOT_CAT_COMBAT.attackHitRangeY
    );
  }

  /**
   * Spielt die Treffersequenz einmal ab und pausiert dabei die Bewegung.
   * @param {Phaser.GameObjects.Sprite} robotCat - Getroffene Roboterkatze.
   * @returns {void}
   */
  static showHitFeedback(robotCat) {
    const eventName = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
      ROBOT_CAT_HIT_TEXTURE.animationKey;
    if (!robotCat.getData("isHitReacting")) {
      robotCat.setData("isHitReacting", true);
      robotCat.setData(
        "hitPreviousMovementState",
        robotCat.getData("movementState"),
      );
    }
    robotCat.off(eventName);
    robotCat.once(eventName, () => this.finishHitFeedback(robotCat));
    robotCat.play(ROBOT_CAT_HIT_TEXTURE.animationKey, true)
      .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight);
  }

  /**
   * Kehrt ohne Positionswechsel in den vorherigen Bewegungszustand zurück.
   * @param {Phaser.GameObjects.Sprite} robotCat - Getroffene Roboterkatze.
   * @returns {void}
   */
  static finishHitFeedback(robotCat) {
    robotCat.setData("isHitReacting", false);
    if (!robotCat.active) return;
    const previousState = robotCat.getData("hitPreviousMovementState");
    if (previousState === ROBOT_CAT_STATES.walking) {
      robotCat.play(ROBOT_CAT_WALK_TEXTURE.animationKey, true)
        .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight);
      return;
    }
    robotCat.setTexture(ROBOT_CAT_FLIGHT_TEXTURE.key, 2)
      .setDisplaySize(ROBOT_CAT.flightDisplaySize, ROBOT_CAT.flightDisplaySize);
  }

  /**
   * Stoppt Bewegung und spielt beim neunten Treffer die finale Sequenz ab.
   * @param {Phaser.GameObjects.Sprite} robotCat - Besiegte Roboterkatze.
   * @returns {void}
   */
  static defeat(robotCat) {
    const hitEventName = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
      ROBOT_CAT_HIT_TEXTURE.animationKey;
    robotCat.off(hitEventName);
    robotCat.setData("isHitReacting", false);
    robotCat.setData("isDefeated", true);
    const collision = robotCat.getData("collision");
    if (collision?.body) collision.body.enable = false;
    robotCat.setActive(true).setVisible(true).setAlpha(1);
    robotCat.anims.stop();
    robotCat.setY(robotCat.getData("groundY"))
      .setDepth(ROBOT_CAT.depth + 1)
      .setTexture(ROBOT_CAT_DEAD_TEXTURE.key, 0)
      .play(ROBOT_CAT_DEAD_TEXTURE.animationKey)
      .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight);
  }
}
