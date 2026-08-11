import Phaser from "phaser";
import { LEVEL_TWO } from "../../js/config/level-two-settings.js";
import {
  BULLDOG_ANIMATION_KEYS,
  BULLDOG_TEXTURES,
} from "../../js/config/bulldog-animation-settings.js";

/** Verarbeitet Treffer der mutierten Bulldogge gegen die Level-2-Drohnen. */
export class LevelTwoDroneCombatSystem {
  /**
   * Prüft den aktiven Schlag und beschädigt höchstens eine erreichbare Drohne.
   * @param {Phaser.GameObjects.Sprite[]} drones - Aktive Leveldrohnen.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Spielfigur.
   * @returns {boolean} `true`, wenn eine Drohne getroffen wurde.
   */
  static update(drones = [], player) {
    if (!this.isImpactFrameReady(player)) return false;
    const target = this.findNearestTarget(drones, player);
    if (!target) return false;

    player.attackHitConsumed = true;
    return this.applyHit(target);
  }

  /**
   * Prüft, ob gerade der Trefferframe eines mutierten Schlages aktiv ist.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Spielfigur.
   * @returns {boolean} `true` im noch nicht verbrauchten Trefferframe.
   */
  static isImpactFrameReady(player) {
    if (!player?.isMutated || !player.isAttacking || player.attackHitConsumed) {
      return false;
    }
    const animationKey = player.anims.currentAnim?.key;
    const texture = this.getAttackTexture(animationKey);
    return Boolean(
      texture &&
      player.anims.currentFrame?.textureFrame === texture.frameCount - 1,
    );
  }

  /**
   * Liefert die Texturdaten der beiden mutierten Schlagvarianten.
   * @param {string} animationKey - Aktueller Animationsschlüssel.
   * @returns {object|null} Passende Texturkonfiguration oder `null`.
   */
  static getAttackTexture(animationKey) {
    if (animationKey === BULLDOG_ANIMATION_KEYS.mutationAttackLeft) {
      return BULLDOG_TEXTURES.mutationAttackLeft;
    }
    if (animationKey === BULLDOG_ANIMATION_KEYS.mutationAttackRight) {
      return BULLDOG_TEXTURES.mutationAttackRight;
    }
    return null;
  }

  /**
   * Sucht die nächste Drohne innerhalb von Blickrichtung und Schlagreichweite.
   * @param {Phaser.GameObjects.Sprite[]} drones - Aktive Leveldrohnen.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Spielfigur.
   * @returns {Phaser.GameObjects.Sprite|null} Nächstes erreichbares Ziel.
   */
  static findNearestTarget(drones, player) {
    const settings = LEVEL_TWO.drones;
    const facingDirection = player.flipX ? -1 : 1;
    return drones
      .filter((drone) => this.isTargetInRange(
        drone,
        player,
        facingDirection,
        settings,
      ))
      .sort((left, right) =>
        Math.abs(left.x - player.x) - Math.abs(right.x - player.x)
      )[0] ?? null;
  }

  /**
   * Prüft Zustand, horizontale Richtung und vertikale Erreichbarkeit.
   * @param {Phaser.GameObjects.Sprite} drone - Zu prüfende Drohne.
   * @param {Phaser.Physics.Arcade.Sprite} player - Angreifende Bulldogge.
   * @param {number} facingDirection - Blickrichtung der Bulldogge.
   * @param {object} settings - Reichweitenwerte des Angriffs.
   * @returns {boolean} Ob die Drohne getroffen werden kann.
   */
  static isTargetInRange(drone, player, facingDirection, settings) {
    if (!drone?.active || drone.getData("isDestroyed")) return false;
    const distanceX = drone.x - player.x;
    return (
      distanceX * facingDirection >= 0 &&
      Math.abs(distanceX) <= settings.attackHitRangeX &&
      Math.abs(drone.y - player.y) <= settings.attackHitRangeY
    );
  }

  /**
   * Zählt einen Treffer und startet beim letzten Treffer die Explosion.
   * @param {Phaser.GameObjects.Sprite} drone - Getroffene Drohne.
   * @returns {boolean} `true` nach der erfolgreichen Trefferverarbeitung.
   */
  static applyHit(drone) {
    const remainingHitPoints = Math.max(
      0,
      drone.getData("hitPoints") - 1,
    );
    drone.setData("hitPoints", remainingHitPoints);
    if (remainingHitPoints > 0) {
      this.showHitFeedback(drone);
      return true;
    }
    this.destroyDrone(drone);
    return true;
  }

  /**
   * Blendet die getroffene Drohne für einen kurzen Moment sichtbar ab.
   * @param {Phaser.GameObjects.Sprite} drone - Getroffene Drohne.
   * @returns {void}
   */
  static showHitFeedback(drone) {
    drone.scene.tweens.add({
      targets: drone,
      alpha: 0.35,
      duration: 70,
      yoyo: true,
    });
  }

  /**
   * Stoppt alle Drohnensysteme und spielt die Zerstörung vollständig ab.
   * @param {Phaser.GameObjects.Sprite} drone - Zerstörte Drohne.
   * @returns {void}
   */
  static destroyDrone(drone) {
    const settings = drone.getData("drone");
    drone.setData("isDestroyed", true);
    drone.setData("isAlert", false);
    drone.getData("patrolTween")?.stop();
    drone.getData("hoverTween")?.stop();
    drone.getData("beam")?.clear();
    drone.setOrigin(0.5).setFlipX(false).setAlpha(1);
    drone.play(settings.destructionAnimationKey);
    drone.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
        settings.destructionAnimationKey,
      () => drone.disableInteractive().setActive(false).setVisible(false),
    );
  }
}
