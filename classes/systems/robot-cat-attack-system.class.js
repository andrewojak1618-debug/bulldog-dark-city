import {
  ROBOT_CAT,
  ROBOT_CAT_ATTACK,
  ROBOT_CAT_ATTACK_TEXTURE,
  ROBOT_CAT_CLAWS_TEXTURE,
  ROBOT_CAT_STATES,
  ROBOT_CAT_WALK_TEXTURE,
} from "../../js/config/robot-cat-settings.js";
import { BulldogMutationStateSystem } from
  "./bulldog-mutation-state-system.class.js";
import { RobotCatAudioSystem } from
  "./robot-cat-audio-system.class.js";

const ANIMATION_COMPLETE_PREFIX = "animationcomplete-";
const MILLISECONDS_PER_SECOND = 1_000;

/** Steuert Angriffsanimation, Klauenflug und Schaden des Level-3-Bosses. */
export class RobotCatAttackSystem {
  /**
   * Erstellt das Angriffssystem mit einer kurzen Startverzögerung.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {Phaser.GameObjects.Sprite} robotCat - Angreifender Boss.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player
   * Steuerbare Bulldogge.
   * @param {import("./health-system.class.js").HealthSystem} health
   * Lebenspunkte der Bulldogge.
   * @returns {RobotCatAttackSystem} Erstelltes Angriffssystem.
   */
  static create(scene, robotCat, player, health) {
    return new RobotCatAttackSystem(scene, robotCat, player, health);
  }

  /**
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {Phaser.GameObjects.Sprite} robotCat - Angreifender Boss.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player
   * Steuerbare Bulldogge.
   * @param {import("./health-system.class.js").HealthSystem} health
   * Lebenspunkte der Bulldogge.
   */
  constructor(scene, robotCat, player, health) {
    this.scene = scene;
    this.robotCat = robotCat;
    this.player = player;
    this.health = health;
    this.projectiles = new Set();
    this.launchEvent = null;
    this.nextAttackAt = scene.time.now + ROBOT_CAT_ATTACK.initialDelayMs;
  }

  /**
   * Startet mögliche Angriffe und bewegt alle aktiven Klaueneffekte.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  update(time, delta) {
    this.updateProjectiles(time, delta);
    if (this.robotCat.getData("isDefeated")) {
      this.cancelAttack(true);
      return;
    }
    if (this.robotCat.getData("isHitReacting")) {
      this.cancelAttack(false);
      return;
    }
    if (this.robotCat.getData("isAttacking")) return;
    if (!this.canStartAttack(time)) return;
    this.startAttack();
  }

  /**
   * Prüft Zeitfenster, Bodenzustand und Reichweite vor einem neuen Angriff.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {boolean} Ob die Roboterkatze jetzt angreifen darf.
   */
  canStartAttack(time) {
    return (
      time >= this.nextAttackAt &&
      this.robotCat.active &&
      !this.player?.isKnockedOut &&
      !this.player?.isMutating &&
      this.robotCat.getData("movementState") === ROBOT_CAT_STATES.walking &&
      RobotCatAttackSystem.isTargetInRange(this.robotCat, this.player)
    );
  }

  /**
   * Prüft die für den 400-Pixel-Klauenangriff gültige Zieldistanz.
   * @param {Phaser.GameObjects.Sprite} robotCat - Angreifende Roboterkatze.
   * @param {Phaser.Physics.Arcade.Sprite} player - Anvisierte Bulldogge.
   * @returns {boolean} Ob die Bulldogge im Angriffsbereich steht.
   */
  static isTargetInRange(robotCat, player) {
    if (!robotCat?.active || !player?.active || !player.body?.enable) {
      return false;
    }
    const playerCenterY = player.body.y + player.body.height / 2;
    return (
      Math.abs(player.x - robotCat.x) <= ROBOT_CAT_ATTACK.triggerRangeX &&
      Math.abs(playerCenterY - robotCat.y) <= ROBOT_CAT_ATTACK.triggerRangeY
    );
  }

  /**
   * Friert die Patrouille ein und richtet die Attacke zur Bulldogge aus.
   * @returns {void}
   */
  startAttack() {
    const texture = ROBOT_CAT_ATTACK_TEXTURE;
    const direction = this.player.x < this.robotCat.x ? -1 : 1;
    this.robotCat.setData("direction", direction);
    this.robotCat.setData("isAttacking", true);
    this.robotCat.setFlipX(direction > 0)
      .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight)
      .play(texture.animationKey, true);
    this.scheduleClawLaunch(texture, direction);
    this.bindAttackCompletion();
  }

  /**
   * Startet den Klauenflug exakt beim ausgestreckten Angriffsframe.
   * @param {object} texture - Konfiguration der Angriffsanimation.
   * @param {-1|1} direction - Blickrichtung der Roboterkatze.
   * @returns {void}
   */
  scheduleClawLaunch(texture, direction) {
    const delay = texture.launchFrame / texture.frameRate *
      MILLISECONDS_PER_SECOND;
    this.launchEvent = this.scene.time.delayedCall(
      delay,
      () => {
        this.launchEvent = null;
        if (!this.robotCat.getData("isAttacking")) return;
        this.launchClaws(direction);
      },
    );
  }

  /**
   * Beendet den Angriff nach dem letzten sichtbaren Frame genau einmal.
   * @returns {void}
   */
  bindAttackCompletion() {
    this.robotCat.once(
      this.getAttackCompleteEventName(),
      () => this.finishAttack(),
    );
  }

  /**
   * Erzeugt einen animierten Klaueneffekt mit festem 400-Pixel-Flugweg.
   * @param {-1|1} direction - Horizontale Angriffsrichtung.
   * @returns {void}
   */
  launchClaws(direction) {
    const settings = ROBOT_CAT_ATTACK;
    const startX = this.robotCat.x + direction * settings.launchOffsetX;
    const startY = this.robotCat.y - settings.launchOffsetY;
    const aim = RobotCatAttackSystem.getAimVector(
      startX,
      startY,
      this.player,
      direction,
    );
    const sprite = this.createClawSprite(startX, startY, direction);
    RobotCatAudioSystem.playClawAttack(this.scene);
    this.addProjectile(sprite, aim);
  }

  /**
   * Erstellt den sichtbaren Klaueneffekt an seiner Startposition.
   * @param {number} startX - Horizontale Startposition.
   * @param {number} startY - Vertikale Startposition.
   * @param {-1|1} direction - Horizontale Angriffsrichtung.
   * @returns {Phaser.GameObjects.Sprite} Erstellter Klaueneffekt.
   */
  createClawSprite(startX, startY, direction) {
    const settings = ROBOT_CAT_ATTACK;
    return this.scene.add.sprite(
      startX,
      startY,
      ROBOT_CAT_CLAWS_TEXTURE.key,
      0,
    ).setDisplaySize(
      settings.projectileDisplaySize,
      settings.projectileDisplaySize,
    ).setDepth(settings.depth)
      .setFlipX(direction > 0)
      .play(ROBOT_CAT_CLAWS_TEXTURE.animationKey);
  }

  /**
   * Registriert Bewegungsdaten eines neuen Klauenprojektils.
   * @param {Phaser.GameObjects.Sprite} sprite - Sichtbarer Klaueneffekt.
   * @param {{x: number, y: number}} aim - Normierte Flugrichtung.
   * @returns {void}
   */
  addProjectile(sprite, aim) {
    const speed = ROBOT_CAT_ATTACK.projectileSpeed;
    this.projectiles.add({
      sprite,
      velocityX: aim.x * speed,
      velocityY: aim.y * speed,
      distance: 0,
    });
  }

  /**
   * Berechnet eine normierte Flugrichtung zum aktuellen Mittelpunkt des Ziels.
   * @param {number} startX - Horizontale Startposition.
   * @param {number} startY - Vertikale Startposition.
   * @param {Phaser.Physics.Arcade.Sprite} player - Anvisierte Bulldogge.
   * @param {-1|1} fallbackDirection - Richtung bei identischen Positionen.
   * @returns {{x: number, y: number}} Normierter Richtungsvektor.
   */
  static getAimVector(startX, startY, player, fallbackDirection) {
    const targetX = player?.body?.center?.x ?? player?.x ?? startX;
    const targetY = player?.body?.center?.y ?? player?.y ?? startY;
    const distanceX = targetX - startX;
    const distanceY = targetY - startY;
    const length = Math.hypot(distanceX, distanceY);
    if (length === 0) return { x: fallbackDirection, y: 0 };
    return { x: distanceX / length, y: distanceY / length };
  }

  /**
   * Bewegt Klauen, löst Treffer aus und entfernt Fehlschüsse nach 400 Pixeln.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  updateProjectiles(time, delta) {
    [...this.projectiles].forEach((projectile) => {
      this.updateProjectile(projectile, time, delta);
    });
  }

  /**
   * Bewegt ein Projektil und wertet Treffer oder maximale Flugdistanz aus.
   * @param {object} projectile - Bewegungsdaten des Klaueneffekts.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  updateProjectile(projectile, time, delta) {
    this.moveProjectile(projectile, delta);
    if (this.hitsPlayer(projectile.sprite)) {
      this.resolvePlayerHit(time);
      this.dissolveProjectile(projectile);
      return;
    }
    if (projectile.distance >= ROBOT_CAT_ATTACK.projectileDistance) {
      this.dissolveProjectile(projectile);
    }
  }

  /**
   * Verschiebt ein Projektil anhand seiner Geschwindigkeit und Framezeit.
   * @param {object} projectile - Bewegungsdaten des Klaueneffekts.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  moveProjectile(projectile, delta) {
    const factor = delta / MILLISECONDS_PER_SECOND;
    const movementX = projectile.velocityX * factor;
    const movementY = projectile.velocityY * factor;
    projectile.sprite.x += movementX;
    projectile.sprite.y += movementY;
    projectile.distance += Math.hypot(movementX, movementY);
  }

  /**
   * Prüft einen verkleinerten Effektbereich gegen die echte Bulldog-Hitbox.
   * @param {Phaser.GameObjects.Sprite} sprite - Sichtbarer Klaueneffekt.
   * @returns {boolean} Ob der Effekt die Bulldogge berührt.
   */
  hitsPlayer(sprite) {
    const body = this.player?.body;
    if (!body?.enable || this.player.isKnockedOut) return false;
    const radius = ROBOT_CAT_ATTACK.projectileDisplaySize / 2 -
      ROBOT_CAT_ATTACK.projectileHitboxInset;
    return !(
      sprite.x + radius < body.x ||
      sprite.x - radius > body.x + body.width ||
      sprite.y + radius < body.y ||
      sprite.y - radius > body.y + body.height
    );
  }

  /**
   * Zieht einmalig Klauenschaden ab und startet Treffer- oder K.-o.-Reaktion.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  resolvePlayerHit(time) {
    if (
      this.player.isHit ||
      this.player.isKnockedOut ||
      !BulldogMutationStateSystem.canReceiveNormalDamage(this.player)
    ) return;
    const remainingHealth = this.health.takeDamage(ROBOT_CAT_ATTACK.damage);
    if (remainingHealth === 0) {
      this.player.knockOut();
      return;
    }
    this.player.takeHit(time);
  }

  /**
   * Blendet einen Treffer oder Fehlschuss weich aus und zerstört ihn danach.
   * @param {{sprite: Phaser.GameObjects.Sprite}} projectile - Klauenprojektil.
   * @returns {void}
   */
  dissolveProjectile(projectile) {
    if (!this.projectiles.delete(projectile)) return;
    projectile.sprite.anims.stop();
    this.scene.tweens.add({
      targets: projectile.sprite,
      alpha: 0,
      scaleX: projectile.sprite.scaleX * ROBOT_CAT_ATTACK.dissolveScale,
      scaleY: projectile.sprite.scaleY * ROBOT_CAT_ATTACK.dissolveScale,
      duration: ROBOT_CAT_ATTACK.dissolveDurationMs,
      onComplete: () => projectile.sprite.destroy(),
    });
  }

  /**
   * Setzt nach der Attacke Laufanimation und Abklingzeit wieder ein.
   * @returns {void}
   */
  finishAttack() {
    this.launchEvent?.remove(false);
    this.launchEvent = null;
    this.robotCat.setData("isAttacking", false);
    this.nextAttackAt = this.scene.time.now + ROBOT_CAT_ATTACK.cooldownMs;
    if (
      this.robotCat.getData("isDefeated") ||
      this.robotCat.getData("isHitReacting")
    ) return;
    this.robotCat.play(ROBOT_CAT_WALK_TEXTURE.animationKey, true)
      .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight);
  }

  /**
   * Bricht einen unterbrochenen Angriff ab und entfernt optional alle Klauen.
   * @param {boolean} removeProjectiles - Ob fliegende Klauen ausblenden sollen.
   * @returns {void}
   */
  cancelAttack(removeProjectiles) {
    if (this.robotCat.getData("isAttacking")) {
      this.robotCat.setData("isAttacking", false);
      this.robotCat.off(this.getAttackCompleteEventName());
      this.launchEvent?.remove(false);
      this.launchEvent = null;
      this.nextAttackAt = this.scene.time.now + ROBOT_CAT_ATTACK.cooldownMs;
    }
    if (removeProjectiles) {
      [...this.projectiles].forEach((projectile) => {
        this.dissolveProjectile(projectile);
      });
    }
  }

  /**
   * Liefert den eindeutigen Phaser-Ereignisnamen dieser Angriffsanimation.
   * @returns {string} Ereignisname für das Animationsende.
   */
  getAttackCompleteEventName() {
    return ANIMATION_COMPLETE_PREFIX + ROBOT_CAT_ATTACK_TEXTURE.animationKey;
  }
}
