import Phaser from "phaser";
import { Enemy } from "./enemy.class.js";
import {
  MUTANT_CAT,
  MUTANT_CAT_ANIMATION_KEY,
  MUTANT_CAT_ATTENTIVE_ANIMATION_KEY,
  MUTANT_CAT_ATTENTIVE_TEXTURE,
  MUTANT_CAT_ATTACK_ANIMATION_KEY,
  MUTANT_CAT_DEAD_ANIMATION_KEY,
  MUTANT_CAT_DEAD_TEXTURE,
  MUTANT_CAT_EVENTS,
} from "../../../js/config/mutant-cat-settings.js";
import { MutantCatAudioSystem } from
  "../../systems/mutant-cat-audio-system.class.js";

const CAT_STATES = Object.freeze({
  patrol: "patrol",
  attentive: "attentive",
  chase: "chase",
  attack: "attack",
  hit: "hit",
  dead: "dead",
});

/**
 * Patrouilliert als mutierte Katze innerhalb eines konfigurierten Abschnitts.
 */
export class MutantCat extends Enemy {
  /**
   * Erstellt die Katze mit einer bodennahen Arcade-Physics-Hitbox.
   * @param {Phaser.Scene} scene - Zugehörige Level-2-Szene.
   * @param {number} x - Horizontale Startposition.
   * @param {number} y - Vertikale Startposition.
   * @param {string} texture - Schlüssel der Lauftextur.
   * @param {{minX: number, maxX: number, initialDirection: -1|1}} patrol -
   * Individuelle Patrouillengrenzen und Startrichtung.
   */
  constructor(scene, x, y, texture, patrol) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(MUTANT_CAT.displayWidth, MUTANT_CAT.displayHeight);
    this.body
      .setSize(MUTANT_CAT.bodyWidth, MUTANT_CAT.bodyHeight)
      .setOffset(MUTANT_CAT.bodyOffsetX, MUTANT_CAT.bodyOffsetY);
    this.setCollideWorldBounds(true);
    this.patrolMinX = patrol.minX;
    this.patrolMaxX = patrol.maxX;
    this.patrolDirection = patrol.initialDirection;
    this.state = CAT_STATES.patrol;
    this.nextAttackAt = 0;
    this.attackHitConsumed = false;
    this.receivedBiteHits = 0;
    this.firstBiteHitAt = null;
    this.hitReactionEndsAt = 0;
    this.isDead = false;
    this.play(MUTANT_CAT_ANIMATION_KEY);
  }

  /**
   * Wechselt abhängig von der Bulldogge zwischen Reaktion und Patrouille.
   * @param {Phaser.Physics.Arcade.Sprite} player - Begegnende Bulldogge.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  updateBehavior(player, time) {
    if (this.isDead) return;
    if (!this.canContinueBehavior(time)) return;
    if (this.shouldDisengage(player)) {
      this.resumePatrol();
      this.updatePatrol();
      return;
    }
    this.updateEngagedBehavior(player, time);
  }

  /**
   * Beendet eine abgelaufene Trefferreaktion und sperrt laufende Aktionen.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {boolean} `true`, wenn ein neuer Verhaltensschritt erlaubt ist.
   */
  canContinueBehavior(time) {
    if (this.state === CAT_STATES.attack) return false;
    if (this.state !== CAT_STATES.hit) return true;
    if (time < this.hitReactionEndsAt) return false;
    this.state = CAT_STATES.chase;
    return true;
  }

  /**
   * Wählt für eine aktive Begegnung Reaktion, Abklingzeit oder Bewegung.
   * @param {Phaser.Physics.Arcade.Sprite} player - Begegnende Bulldogge.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  updateEngagedBehavior(player, time) {
    if (this.state === CAT_STATES.patrol) {
      this.showAttentiveReaction(player);
      return;
    }
    this.facePlayer(player);
    if (this.state === CAT_STATES.attentive) return;
    if (time < this.nextAttackAt) {
      this.showAttackCooldownFrame();
      return;
    }
    if (this.getHorizontalDistance(player) <= MUTANT_CAT.attackRange) {
      this.startAttack();
      return;
    }
    this.chasePlayer(player);
  }

  /**
   * Prüft horizontale Entfernung und annähernd gleiche Laufhöhe.
   * @param {Phaser.Physics.Arcade.Sprite} player - Begegnende Bulldogge.
   * @returns {boolean} `true`, sobald die Katze die Bulldogge bemerkt.
   */
  canDetect(player) {
    if (!player?.body || !this.body) return false;
    return this.getHorizontalDistance(player) <= MUTANT_CAT.detectionRange &&
      this.isWithinDetectionHeight(player);
  }

  /**
   * Prüft, ob sich die Bulldogge maximal auf Höhe einer Nuklearbox befindet.
   * @param {Phaser.Physics.Arcade.Sprite} player - Begegnende Bulldogge.
   * @returns {boolean} `true`, wenn Sichtung und Angriff vertikal erlaubt sind.
   */
  isWithinDetectionHeight(player) {
    if (!player?.body || !this.body) return false;
    const heightDifference = Math.abs(player.body.bottom - this.body.bottom);
    return heightDifference <= MUTANT_CAT.detectionHeightTolerance;
  }

  /**
   * Beendet eine Begegnung erst außerhalb des größeren Rückzugsradius.
   * @param {Phaser.Physics.Arcade.Sprite} player - Begegnende Bulldogge.
   * @returns {boolean} `true`, wenn die Patrouille wieder beginnen soll.
   */
  shouldDisengage(player) {
    if (!this.isWithinDetectionHeight(player)) return true;
    if (this.state === CAT_STATES.patrol) return !this.canDetect(player);
    return this.getHorizontalDistance(player) > MUTANT_CAT.disengageRange;
  }

  /**
   * Stoppt die Katze, richtet sie aus und spielt die Reaktion einmal ab.
   * @param {Phaser.Physics.Arcade.Sprite} player - Begegnende Bulldogge.
   * @returns {void}
   */
  showAttentiveReaction(player) {
    this.setVelocityX(0);
    this.facePlayer(player);
    this.state = CAT_STATES.attentive;
    MutantCatAudioSystem.playAttentive(this.scene);
    this.play(MUTANT_CAT_ATTENTIVE_ANIMATION_KEY);
    this.once(this.getAnimationCompleteEvent(
      MUTANT_CAT_ATTENTIVE_ANIMATION_KEY,
    ), () => {
      if (this.state === CAT_STATES.attentive) this.state = CAT_STATES.chase;
    });
  }

  /**
   * Startet nach Verlassen des Sichtbereichs wieder die Laufanimation.
   * @returns {void}
   */
  resumePatrol() {
    if (this.state === CAT_STATES.patrol) return;
    this.state = CAT_STATES.patrol;
    this.play(MUTANT_CAT_ANIMATION_KEY);
  }

  /**
   * Läuft innerhalb des Boxenabschnitts auf die Bulldogge zu.
   * @param {Phaser.Physics.Arcade.Sprite} player - Verfolgte Bulldogge.
   * @returns {void}
   */
  chasePlayer(player) {
    const direction = Math.sign(player.x - this.x);
    this.state = CAT_STATES.chase;
    this.play(MUTANT_CAT_ANIMATION_KEY, true);
    this.setVelocityX(direction * MUTANT_CAT.chaseSpeed);
  }

  /** Startet eine einzelne Angriffssequenz in Nahkampfreichweite. */
  startAttack() {
    this.state = CAT_STATES.attack;
    this.attackHitConsumed = false;
    this.setVelocityX(0);
    this.applyAttackDisplaySize();
    this.play(MUTANT_CAT_ATTACK_ANIMATION_KEY);
    this.once(this.getAnimationCompleteEvent(
      MUTANT_CAT_ATTACK_ANIMATION_KEY,
    ), () => this.finishAttack());
  }

  /** Beendet den Angriff und startet dessen Abklingzeit. */
  finishAttack() {
    this.restoreDefaultDisplaySize();
    this.state = CAT_STATES.chase;
    this.nextAttackAt = this.scene.time.now + MUTANT_CAT.attackCooldownMs;
    this.showAttackCooldownFrame();
  }

  /** Zeigt während der Abklingzeit die letzte Alarmhaltung. */
  showAttackCooldownFrame() {
    this.setVelocityX(0);
    this.setTexture(MUTANT_CAT_ATTENTIVE_TEXTURE.key, 3);
  }

  /**
   * Vergrößert den Angriff bodenfest auf 120 Prozent.
   * @returns {void}
   */
  applyAttackDisplaySize() {
    const extraHeight = MUTANT_CAT.displayHeight *
      (MUTANT_CAT.attackDisplayScale - 1);
    this.y -= extraHeight / 2;
    this.setDisplaySize(
      MUTANT_CAT.displayWidth * MUTANT_CAT.attackDisplayScale,
      MUTANT_CAT.displayHeight * MUTANT_CAT.attackDisplayScale,
    );
  }

  /**
   * Stellt nach der Attacke Größe und Bodenposition wieder her.
   * @returns {void}
   */
  restoreDefaultDisplaySize() {
    const extraHeight = MUTANT_CAT.displayHeight *
      (MUTANT_CAT.attackDisplayScale - 1);
    this.setDisplaySize(MUTANT_CAT.displayWidth, MUTANT_CAT.displayHeight);
    this.y += extraHeight / 2;
  }

  /**
   * Bringt die Katze nach einem tödlichen Treffer sicher auf den Boden zurück.
   * @returns {void}
   */
  settleAfterKnockOut() {
    const wasAttacking = this.state === CAT_STATES.attack;

    this.anims.stop();
    if (wasAttacking) this.restoreDefaultDisplaySize();
    this.state = CAT_STATES.attentive;
    this.setVelocity(0, 0);
    this.setTexture(MUTANT_CAT_ATTENTIVE_TEXTURE.key, 3);
  }

  /**
   * Zeigt pro Biss den ersten Trefferframe und startet beim neunten den Tod.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {boolean} `true`, sobald die Katze besiegt wurde.
   */
  takeBiteHit(time) {
    if (this.isDead || this.state === CAT_STATES.hit) return false;
    this.prepareBiteHit(time);
    if (this.receivedBiteHits >= MUTANT_CAT.biteHitsToDefeat) {
      this.startDeath(time);
      return true;
    }
    this.showBiteHitReaction(time);
    return false;
  }

  /**
   * Stoppt die laufende Aktion und zählt einen gültigen Biss.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  prepareBiteHit(time) {
    const wasAttacking = this.state === CAT_STATES.attack;
    if (this.firstBiteHitAt === null) this.firstBiteHitAt = time;
    this.receivedBiteHits += 1;
    this.setVelocityX(0);
    this.anims.stop();
    if (wasAttacking) this.restoreDefaultDisplaySize();
  }

  /**
   * Zeigt für einen nicht tödlichen Biss kurz den Trefferframe.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  showBiteHitReaction(time) {
    this.state = CAT_STATES.hit;
    this.hitReactionEndsAt = time + MUTANT_CAT.hitReactionMs;
    this.setTexture(MUTANT_CAT_DEAD_TEXTURE.key, 0);
  }

  /**
   * Beendet Bewegung und KI und meldet den Sieg nach der Todessequenz.
   * @param {number} time - Zeitpunkt des entscheidenden neunten Treffers.
   * @returns {void}
   */
  startDeath(time) {
    this.state = CAT_STATES.dead;
    this.isDead = true;
    this.attackHitConsumed = true;
    this.setVelocity(0, 0);
    this.play(MUTANT_CAT_DEAD_ANIMATION_KEY);
    const elapsedMs = Math.max(0, time - this.firstBiteHitAt);
    this.once(this.getAnimationCompleteEvent(
      MUTANT_CAT_DEAD_ANIMATION_KEY,
    ), () => this.emitDefeatResult(elapsedMs));
    this.body.enable = false;
  }

  /**
   * Meldet Position und gemessene Kampfzeit an das Belohnungssystem.
   * @param {number} elapsedMs - Kampfzeit vom ersten bis zum letzten Biss.
   * @returns {void}
   */
  emitDefeatResult(elapsedMs) {
    this.emit(MUTANT_CAT_EVENTS.defeated, {
      x: this.x,
      y: this.y,
      elapsedMs,
    });
  }

  /**
   * Meldet genau einen Treffer im konfigurierten Angriffsframe.
   * @param {Phaser.Physics.Arcade.Sprite} player - Angegriffene Bulldogge.
   * @returns {boolean} `true`, wenn dieser Angriff neu getroffen hat.
   */
  consumeAttackHit(player) {
    const isImpactFrame = Number(this.frame.name) ===
      MUTANT_CAT.attackImpactFrame;
    if (this.state !== CAT_STATES.attack ||
        this.attackHitConsumed || !isImpactFrame) return false;
    if (!this.isWithinDetectionHeight(player)) return false;
    if (this.getHorizontalDistance(player) > MUTANT_CAT.attackHitRange) {
      return false;
    }
    this.attackHitConsumed = true;
    return true;
  }

  /**
   * Richtet die Katze zur aktuellen Position der Bulldogge aus.
   * @param {Phaser.Physics.Arcade.Sprite} player - Begegnende Bulldogge.
   * @returns {void}
   */
  facePlayer(player) {
    this.setFlipX(player.x < this.x);
  }

  /**
   * Liefert die horizontale Entfernung zur Bulldogge.
   * @param {Phaser.Physics.Arcade.Sprite} player - Begegnende Bulldogge.
   * @returns {number} Absoluter horizontaler Abstand.
   */
  getHorizontalDistance(player) {
    return player ? Math.abs(player.x - this.x) : Number.POSITIVE_INFINITY;
  }

  /**
   * Liefert den eindeutigen Phaser-Eventnamen eines Animationsendes.
   * @param {string} animationKey - Eindeutiger Animationsschlüssel.
   * @returns {string} Phaser-Eventname für diese Animation.
   */
  getAnimationCompleteEvent(animationKey) {
    return Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animationKey;
  }

  /**
   * Bewegt die Katze innerhalb des konfigurierten Boxenabschnitts.
   * @returns {void}
   */
  updatePatrol() {
    if (this.x <= this.patrolMinX) this.patrolDirection = 1;
    if (this.x >= this.patrolMaxX) this.patrolDirection = -1;
    this.setVelocityX(this.patrolDirection * MUTANT_CAT.patrolSpeed);
    this.setFlipX(this.patrolDirection < 0);
  }
}
