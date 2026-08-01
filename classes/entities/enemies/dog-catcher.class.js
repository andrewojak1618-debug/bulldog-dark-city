import { Enemy } from "./enemy.class.js";
import {
  DOG_CATCHER,
  DOG_CATCHER_ANIMATION_KEYS,
  DOG_CATCHER_EVENTS,
  DOG_CATCHER_TEXTURES,
} from "../../../js/config/dog-catcher-settings.js";

const DOG_CATCHER_STATES = Object.freeze({
  patrol: "patrol",
  alert: "alert",
  chase: "chase",
  attack: "attack",
  hit: "hit",
  dead: "dead",
});

/**
 * Patrouilliert, entdeckt die Bulldogge und führt einen Netzangriff aus.
 */
export class DogCatcher extends Enemy {
  /**
   * Erstellt einen physikbasierten Hundefänger im Testlevel.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {number} x - Horizontale Startposition.
   * @param {number} y - Vertikale Startposition.
   * @param {string} texture - Initialer Texturschlüssel.
   */
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(
      DOG_CATCHER.displayWidth,
      DOG_CATCHER.displayHeight,
    );
    this.body
      .setSize(DOG_CATCHER.bodyWidth, DOG_CATCHER.bodyHeight)
      .setOffset(DOG_CATCHER.bodyOffsetX, DOG_CATCHER.bodyOffsetY);
    this.setCollideWorldBounds(true);
    this.state = DOG_CATCHER_STATES.patrol;
    this.patrolDirection = 1;
    this.hasDetectedPlayer = false;
    this.nextAttackAt = 0;
    this.attackHitConsumed = false;
    this.receivedBiteHits = 0;
    this.hitReactionEndsAt = 0;
    this.isDead = false;
    this.play(DOG_CATCHER_ANIMATION_KEYS.walk);
  }

  /**
   * Aktualisiert Wahrnehmung, Zustandswechsel und Bewegung des Gegners.
   * @param {Phaser.Physics.Arcade.Sprite} player - Zu verfolgende Bulldogge.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  updateBehavior(player, time) {
    if (!player?.active || !this.body || this.isDead) return;

    if (this.state === DOG_CATCHER_STATES.hit) {
      if (time < this.hitReactionEndsAt) return;
      this.state = DOG_CATCHER_STATES.chase;
      this.nextAttackAt = Math.min(this.nextAttackAt, time);
    }

    if (player.isKnockedOut) {
      this.showReadyPose();
      return;
    }

    if (this.isLockedInAnimation()) return;

    const distanceX = player.x - this.x;
    const isDetected = this.isPlayerDetected(player, distanceX);

    if (!isDetected) {
      this.hasDetectedPlayer = false;
      this.updatePatrol();
      return;
    }

    this.faceDirection(Math.sign(distanceX) || this.patrolDirection);

    if (!this.hasDetectedPlayer) {
      this.startAlert();
      return;
    }

    const isWithinAttackRange =
      Math.abs(distanceX) <= DOG_CATCHER.attackRange;

    if (isWithinAttackRange) {
      if (time >= this.nextAttackAt) this.startAttack(time);
      else this.showReadyPose();
      return;
    }

    this.updateChase(distanceX);
  }

  /**
   * Prüft das gerichtete Sichtfeld und den Nahbereich hinter dem Gegner.
   * @param {Phaser.Physics.Arcade.Sprite} player - Zu prüfende Bulldogge.
   * @param {number} distanceX - Horizontaler Abstand zur Bulldogge.
   * @returns {boolean} `true`, wenn der Hundefänger reagieren darf.
   */
  isPlayerDetected(player, distanceX) {
    if (!this.isPlayerOnSameGroundLevel(player)) return false;

    const isInFront = distanceX * this.getFacingDirection() >= 0;
    const detectionRange = isInFront
      ? DOG_CATCHER.detectionRange
      : DOG_CATCHER.rearDetectionRange;

    return Math.abs(distanceX) <= detectionRange;
  }

  /**
   * Vergleicht die Fußpunkte, damit obere Plattformen unsichtbar bleiben.
   * @param {Phaser.Physics.Arcade.Sprite} player - Zu prüfende Bulldogge.
   * @returns {boolean} `true` bei annähernd gleicher Bodenhöhe.
   */
  isPlayerOnSameGroundLevel(player) {
    const playerFeetY = player.body?.bottom;
    const dogCatcherFeetY = this.body?.bottom;

    if (!Number.isFinite(playerFeetY) || !Number.isFinite(dogCatcherFeetY)) {
      return false;
    }

    return (
      Math.abs(playerFeetY - dogCatcherFeetY) <=
      DOG_CATCHER.groundLevelTolerance
    );
  }

  /**
   * Liefert die aktuelle Blickrichtung anhand der Sprite-Spiegelung.
   * @returns {-1|1} Linke oder rechte Blickrichtung.
   */
  getFacingDirection() {
    return this.flipX ? -1 : 1;
  }

  /**
   * Bewegt den Gegner innerhalb seines festgelegten Patrouillenbereichs.
   * @returns {void}
   */
  updatePatrol() {
    this.state = DOG_CATCHER_STATES.patrol;

    if (this.x <= DOG_CATCHER.patrolMinX) this.patrolDirection = 1;
    if (this.x >= DOG_CATCHER.patrolMaxX) this.patrolDirection = -1;

    this.move(this.patrolDirection, DOG_CATCHER.patrolSpeed);
  }

  /**
   * Spielt die einmalige Entdeckungsreaktion ab.
   * @returns {void}
   */
  startAlert() {
    this.state = DOG_CATCHER_STATES.alert;
    this.hasDetectedPlayer = true;
    this.setVelocityX(0);
    this.play(DOG_CATCHER_ANIMATION_KEYS.alert);
  }

  /**
   * Verfolgt die Bulldogge nach abgeschlossener Entdeckungsreaktion.
   * @param {number} distanceX - Horizontaler Abstand zur Bulldogge.
   * @returns {void}
   */
  updateChase(distanceX) {
    this.state = DOG_CATCHER_STATES.chase;
    this.move(Math.sign(distanceX), DOG_CATCHER.chaseSpeed);
  }

  /**
   * Startet einen einzelnen Angriff und setzt dessen Abklingzeit.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  startAttack(time) {
    this.state = DOG_CATCHER_STATES.attack;
    this.nextAttackAt = time + DOG_CATCHER.attackCooldownMs;
    this.attackHitConsumed = false;
    this.setVelocityX(0);
    this.play(DOG_CATCHER_ANIMATION_KEYS.attack);
  }

  /**
   * Meldet einen gültigen Treffer exakt einmal im letzten Attack-Frame.
   * @param {Phaser.Physics.Arcade.Sprite} player - Angegriffene Bulldogge.
   * @returns {boolean} `true`, wenn die Bulldogge vom Netz getroffen wird.
   */
  consumeAttackHit(player) {
    if (
      this.state !== DOG_CATCHER_STATES.attack ||
      this.attackHitConsumed ||
      this.anims.currentAnim?.key !== DOG_CATCHER_ANIMATION_KEYS.attack
    ) {
      return false;
    }

    const lastFrame = DOG_CATCHER_TEXTURES.attack.frameCount - 1;
    const isImpactFrame =
      this.anims.currentFrame?.textureFrame === lastFrame;

    if (!isImpactFrame) return false;

    this.attackHitConsumed = true;
    const distanceX = player.x - this.x;
    const isInAttackDirection =
      distanceX * this.getFacingDirection() >= 0;

    return (
      isInAttackDirection &&
      this.isPlayerOnSameGroundLevel(player) &&
      Math.abs(distanceX) <= DOG_CATCHER.attackHitRange
    );
  }

  /**
   * Verarbeitet einen Biss und startet Trefferreaktion oder Dead-Sequenz.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {boolean} `true`, wenn der Hundefänger besiegt wurde.
   */
  takeBiteHit(time) {
    if (this.isDead || this.state === DOG_CATCHER_STATES.hit) return false;

    this.receivedBiteHits += 1;
    this.setVelocityX(0);
    this.anims.stop();

    if (this.receivedBiteHits >= DOG_CATCHER.biteHitsToDefeat) {
      this.startDeath();
      return true;
    }

    this.state = DOG_CATCHER_STATES.hit;
    this.hitReactionEndsAt = time + DOG_CATCHER.hitReactionMs;
    this.setTexture(DOG_CATCHER_TEXTURES.dead.key, 0);
    return false;
  }

  /**
   * Beendet Bewegung, Physik und KI und spielt die Dead-Animation einmal ab.
   * @returns {void}
   */
  startDeath() {
    this.state = DOG_CATCHER_STATES.dead;
    this.isDead = true;
    this.attackHitConsumed = true;
    this.setVelocity(0, 0);
    this.play(DOG_CATCHER_ANIMATION_KEYS.dead);
    this.once(
      `animationcomplete-${DOG_CATCHER_ANIMATION_KEYS.dead}`,
      () => this.emit(DOG_CATCHER_EVENTS.defeated),
    );
    this.body.enable = false;
  }

  /**
   * Prüft, ob Alert oder Angriff erst vollständig ablaufen müssen.
   * @returns {boolean} `true`, solange eine gesperrte Animation läuft.
   */
  isLockedInAnimation() {
    const isLockedState =
      this.state === DOG_CATCHER_STATES.alert ||
      this.state === DOG_CATCHER_STATES.attack ||
      this.state === DOG_CATCHER_STATES.hit ||
      this.state === DOG_CATCHER_STATES.dead;

    return isLockedState && this.anims.isPlaying;
  }

  /**
   * Verlässt den letzten Attacken-Frame während der Abklingzeit.
   * @returns {void}
   */
  showReadyPose() {
    this.state = DOG_CATCHER_STATES.chase;
    this.setVelocityX(0);
    this.anims.stop();
    this.setTexture(DOG_CATCHER_TEXTURES.walk.key, 0);
  }

  /**
   * Setzt Geschwindigkeit, Blickrichtung und Laufanimation gemeinsam.
   * @param {number} direction - Negative oder positive Laufrichtung.
   * @param {number} speed - Horizontale Geschwindigkeit.
   * @returns {void}
   */
  move(direction, speed) {
    const normalizedDirection = direction < 0 ? -1 : 1;
    this.faceDirection(normalizedDirection);
    this.setVelocityX(normalizedDirection * speed);
    this.play(DOG_CATCHER_ANIMATION_KEYS.walk, true);
  }

  /**
   * Richtet das ursprünglich nach rechts blickende Sprite aus.
   * @param {number} direction - Negative oder positive Blickrichtung.
   * @returns {void}
   */
  faceDirection(direction) {
    this.setFlipX(direction < 0);
  }
}
