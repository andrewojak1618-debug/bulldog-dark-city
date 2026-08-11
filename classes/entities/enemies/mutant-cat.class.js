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
  MUTANT_CAT_STATES,
} from "../../../js/config/mutant-cat-settings.js";
import { MutantCatAudioSystem } from "../../systems/mutant-cat-audio-system.class.js";
import { MutantCatDetectionSystem } from
  "../../systems/mutant-cat-detection-system.class.js";

/** Patrouilliert als mutierte Katze innerhalb eines konfigurierten Abschnitts. */
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
    this.configurePhysics();
    this.initializeState(patrol);
    this.play(MUTANT_CAT_ANIMATION_KEY);
  }

  /**
   * Konfiguriert Darstellung, Hitbox und Weltbegrenzung.
   * @returns {void}
   */
  configurePhysics() {
    this.setDisplaySize(MUTANT_CAT.displayWidth, MUTANT_CAT.displayHeight);
    this.body
      .setSize(MUTANT_CAT.bodyWidth, MUTANT_CAT.bodyHeight)
      .setOffset(MUTANT_CAT.bodyOffsetX, MUTANT_CAT.bodyOffsetY);
    this.setCollideWorldBounds(true);
  }

  /**
   * Initialisiert Patrouillen-, Treffer- und Aktionszustände.
   * @param {{minX: number, maxX: number, initialDirection: -1|1}} patrol -
   * Individuelle Patrouillengrenzen und Startrichtung.
   * @returns {void}
   */
  initializeState(patrol) {
    this.patrolMinX = patrol.minX;
    this.patrolMaxX = patrol.maxX;
    this.patrolDirection = patrol.initialDirection;
    this.state = MUTANT_CAT_STATES.patrol;
    this.nextAttackAt = 0;
    this.attackHitConsumed = false;
    this.isAttackDisplayScaled = false;
    this.receivedBiteHits = 0;
    this.firstBiteHitAt = null;
    this.hitReactionEndsAt = 0;
    this.isDead = false;
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
    if (MutantCatDetectionSystem.shouldDisengage(this, player)) {
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
    if (this.state === MUTANT_CAT_STATES.attack) return false;
    if (this.state !== MUTANT_CAT_STATES.hit) return true;
    if (time < this.hitReactionEndsAt) return false;
    this.state = MUTANT_CAT_STATES.chase;
    return true;
  }

  /**
   * Wählt für eine aktive Begegnung Reaktion, Abklingzeit oder Bewegung.
   * @param {Phaser.Physics.Arcade.Sprite} player - Begegnende Bulldogge.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  updateEngagedBehavior(player, time) {
    if (this.state === MUTANT_CAT_STATES.patrol) {
      this.showAttentiveReaction(player);
      return;
    }
    this.facePlayer(player);
    if (this.state === MUTANT_CAT_STATES.attentive) return;
    if (time < this.nextAttackAt) {
      this.showAttackCooldownFrame();
      return;
    }
    if (MutantCatDetectionSystem.getHorizontalDistance(this, player) <=
        MUTANT_CAT.attackRange) {
      this.startAttack();
      return;
    }
    this.chasePlayer(player);
  }

  /**
   * Stoppt die Katze, richtet sie aus und spielt die Reaktion einmal ab.
   * @param {Phaser.Physics.Arcade.Sprite} player - Begegnende Bulldogge.
   * @returns {void}
   */
  showAttentiveReaction(player) {
    this.setVelocityX(0);
    this.facePlayer(player);
    this.state = MUTANT_CAT_STATES.attentive;
    MutantCatAudioSystem.playAttentive(this.scene);
    this.play(MUTANT_CAT_ATTENTIVE_ANIMATION_KEY);
    this.once(this.getAnimationCompleteEvent(
      MUTANT_CAT_ATTENTIVE_ANIMATION_KEY,
    ), () => {
      if (this.state === MUTANT_CAT_STATES.attentive) {
        this.state = MUTANT_CAT_STATES.chase;
      }
    });
  }

  /**
   * Startet nach Verlassen des Sichtbereichs wieder die Laufanimation.
   * @returns {void}
   */
  resumePatrol() {
    if (this.state === MUTANT_CAT_STATES.patrol) return;
    this.state = MUTANT_CAT_STATES.patrol;
    this.play(MUTANT_CAT_ANIMATION_KEY);
  }

  /**
   * Läuft innerhalb des Boxenabschnitts auf die Bulldogge zu.
   * @param {Phaser.Physics.Arcade.Sprite} player - Verfolgte Bulldogge.
   * @returns {void}
   */
  chasePlayer(player) {
    const direction = Math.sign(player.x - this.x);
    this.state = MUTANT_CAT_STATES.chase;
    this.play(MUTANT_CAT_ANIMATION_KEY, true);
    this.setVelocityX(direction * MUTANT_CAT.chaseSpeed);
  }

  /** Startet eine einzelne Angriffssequenz in Nahkampfreichweite. */
  startAttack() {
    this.state = MUTANT_CAT_STATES.attack;
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
    this.state = MUTANT_CAT_STATES.chase;
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
    if (this.isAttackDisplayScaled) return;
    MutantCatGroundingSystem.resizeKeepingBodyBottom(
      this,
      MUTANT_CAT.displayWidth * MUTANT_CAT.attackDisplayScale,
      MUTANT_CAT.displayHeight * MUTANT_CAT.attackDisplayScale,
    );
    this.isAttackDisplayScaled = true;
  }

  /**
   * Stellt nach der Attacke Größe und Bodenposition wieder her.
   * @returns {void}
   */
  restoreDefaultDisplaySize() {
    if (!this.isAttackDisplayScaled) return;
    MutantCatGroundingSystem.resizeKeepingBodyBottom(
      this,
      MUTANT_CAT.displayWidth,
      MUTANT_CAT.displayHeight,
    );
    this.isAttackDisplayScaled = false;
  }

  /**
   * Bringt die Katze nach einem tödlichen Treffer sicher auf den Boden zurück.
   * @returns {void}
   */
  settleAfterKnockOut() {
    const wasAttacking = this.state === MUTANT_CAT_STATES.attack;

    this.anims.stop();
    if (wasAttacking) this.restoreDefaultDisplaySize();
    this.state = MUTANT_CAT_STATES.attentive;
    this.setVelocity(0, 0);
    this.setTexture(MUTANT_CAT_ATTENTIVE_TEXTURE.key, 3);
  }

  /**
   * Zeigt pro Biss den ersten Trefferframe und startet beim neunten den Tod.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {boolean} `true`, sobald die Katze besiegt wurde.
   */
  takeBiteHit(time) {
    if (this.isDead || this.state === MUTANT_CAT_STATES.hit) return false;
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
    const wasAttacking = this.state === MUTANT_CAT_STATES.attack;
    if (this.firstBiteHitAt === null) this.firstBiteHitAt = time;
    this.receivedBiteHits += 1;
    this.setVelocityX(0);
    this.off(this.getAnimationCompleteEvent(
      MUTANT_CAT_ATTACK_ANIMATION_KEY,
    ));
    this.anims.stop();
    if (wasAttacking) this.restoreDefaultDisplaySize();
  }

  /**
   * Zeigt für einen nicht tödlichen Biss kurz den Trefferframe.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  showBiteHitReaction(time) {
    this.state = MUTANT_CAT_STATES.hit;
    this.hitReactionEndsAt = time + MUTANT_CAT.hitReactionMs;
    this.setTexture(MUTANT_CAT_DEAD_TEXTURE.key, 0);
  }

  /**
   * Beendet Bewegung und KI und meldet den Sieg nach der Todessequenz.
   * @param {number} time - Zeitpunkt des entscheidenden neunten Treffers.
   * @returns {void}
   */
  startDeath(time) {
    this.state = MUTANT_CAT_STATES.dead;
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
    if (this.state !== MUTANT_CAT_STATES.attack ||
        this.attackHitConsumed || !isImpactFrame) return false;
    if (!MutantCatDetectionSystem.isWithinHeight(this, player)) return false;
    if (MutantCatDetectionSystem.getHorizontalDistance(this, player) >
        MUTANT_CAT.attackHitRange) {
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
