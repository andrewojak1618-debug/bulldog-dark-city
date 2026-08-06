import Phaser from "phaser";
import { BULLDOG_GAMEPLAY } from "../../../js/config/bulldog-gameplay-settings.js";
import {
  BULLDOG_ANIMATION_KEYS,
  BULLDOG_ANIMATION_TIMING,
  BULLDOG_ATTACK_TEXTURES,
  BULLDOG_EVENTS,
  BULLDOG_TEXTURES,
} from "../../../js/config/bulldog-animation-settings.js";
import { BulldogMovementAnimationSystem } from
  "../../systems/bulldog-movement-animation-system.class.js";
import { BulldogAudioSystem } from
  "../../systems/bulldog-audio-system.class.js";
import { BulldogMutationStateSystem } from
  "../../systems/bulldog-mutation-state-system.class.js";

/**
 * Bildet die steuerbare Bulldogge des technischen Prototyps ab.
 */
export class Bulldog extends Phaser.Physics.Arcade.Sprite {
  /**
   * Erstellt die Bulldogge mit einer angepassten Arcade-Physics-Hitbox.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {number} x - Horizontale Startposition.
   * @param {number} y - Vertikale Startposition.
   * @param {string} texture - Texturschlüssel des Testframes.
   */
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.configurePhysics();
    this.initializeState();
    this.audio = new BulldogAudioSystem(this, scene);
  }

  /**
   * Richtet Größe, Hitbox und Bewegungsgrenzen der Bulldogge ein.
   * @returns {void}
   */
  configurePhysics() {
    const settings = BULLDOG_GAMEPLAY;
    this.setDisplaySize(settings.displayWidth, settings.displayHeight);
    this.body
      .setSize(settings.bodyWidth, settings.bodyHeight)
      .setOffset(settings.bodyOffsetX, settings.bodyOffsetY);
    this.setCollideWorldBounds(true);
    this.setMaxVelocity(settings.moveSpeed, settings.maxFallSpeed);
  }

  /**
   * Initialisiert die veränderlichen Bewegungs- und Aktionszustände.
   * @returns {void}
   */
  initializeState() {
    this.standingStartedAt = null;
    this.wasFalling = false;
    this.isLanding = false;
    this.isAttacking = false;
    this.attackHitConsumed = false;
    this.activeAttackAnimationKey = null;
    this.isHit = false;
    this.hitReactionEndsAt = 0;
    this.isKnockedOut = false;
    BulldogMutationStateSystem.initialize(this);
  }

  /**
   * Wendet Bewegung und Sprung anhand der aktuellen Eingaben an.
   * @param {import("../../input/input-system.class.js").InputSystem} input - Spielereingaben.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  updateMovement(input, time) {
    if (this.isKnockedOut || this.isMutating) return;
    if (this.isMutated) {
      if (this.updateActionState(input, time)) return;
      const direction = input.getHorizontalAxis();
      this.applyMovement(input, direction);
      this.updateMovementAnimations(direction);
      return;
    }
    if (this.updateActionState(input, time)) return;
    const direction = input.getHorizontalAxis();
    this.applyMovement(input, direction);
    this.updateMovementAnimations(direction);
  }

  /**
   * Startet einmalig die sichtbare Verwandlung.
   * @returns {boolean} `true`, wenn die Mutation gestartet wurde.
   */
  startMutation() {
    return BulldogMutationStateSystem.start(this);
  }

  /**
   * Behandelt Trefferreaktion und Angriff, bevor Bewegung erlaubt wird.
   * @param {import("../../input/input-system.class.js").InputSystem} input - Spielereingaben.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {boolean} `true`, solange eine Aktion die Bewegung sperrt.
   */
  updateActionState(input, time) {
    if (this.isHit && time < this.hitReactionEndsAt) {
      this.setVelocityX(0);
      return true;
    }
    if (this.isHit) this.finishHitReaction();
    if (input.consumeAttack()) this.startAttack();
    if (!this.isAttacking) return false;
    this.setVelocityX(0);
    return true;
  }

  /**
   * Überträgt Richtung, Schwerkraft und Sprungimpuls auf die Physik.
   * @param {import("../../input/input-system.class.js").InputSystem} input - Spielereingaben.
   * @param {-1|0|1} direction - Horizontale Bewegungsrichtung.
   * @returns {void}
   */
  applyMovement(input, direction) {
    const isFalling = this.body.velocity.y > 0;
    this.setVelocityX(direction * BULLDOG_GAMEPLAY.moveSpeed);
    this.setGravityY(isFalling ? BULLDOG_GAMEPLAY.fallGravityBoost : 0);
    if (direction !== 0) this.setFlipX(direction < 0);
    if (input.consumeJump() && this.isGrounded()) {
      this.setVelocityY(BULLDOG_GAMEPLAY.jumpVelocity);
    }
  }

  /**
   * Wählt anhand der Physik den passenden Sprung-, Fall- oder Bodenstatus.
   * @param {-1|0|1} direction - Horizontale Bewegungsrichtung.
   * @returns {void}
   */
  updateMovementAnimations(direction) {
    BulldogMovementAnimationSystem.update(this, direction);
  }

  /**
   * Startet einen erlaubten Angriff und sperrt Mehrfachauslösungen.
   * @returns {boolean} `true`, wenn ein neuer Angriff gestartet wurde.
   */
  startAttack() {
    if (!this.canStartAttack()) return false;
    this.prepareAttack();
    this.once(this.getAttackCompleteEventName(), () => this.finishAttack());
    return true;
  }

  /**
   * Prüft Aktionszustand und erlaubte Luftangriffe.
   * @returns {boolean} `true`, wenn ein Angriff beginnen darf.
   */
  canStartAttack() {
    const isAirAttackBlocked = !this.isGrounded() && !this.isMutated;
    return !this.isAttacking && !this.isKnockedOut && !isAirAttackBlocked;
  }

  /**
   * Setzt den Aktionszustand und startet die passende Angriffsanimation.
   * @returns {void}
   */
  prepareAttack() {
    if (!this.isMutated) this.audio.prepareBiteAttack();
    this.isAttacking = true;
    this.attackHitConsumed = false;
    this.standingStartedAt = null;
    this.setVelocityX(0);
    this.anims.stop();
    this.activeAttackAnimationKey =
      BulldogMutationStateSystem.getNextAttackAnimationKey(this);
    this.play(this.activeAttackAnimationKey);
  }

  /**
   * Liefert den Phaser-Ereignisnamen für das Ende des aktiven Angriffs.
   * @returns {string} Vollständiger Animation-Complete-Ereignisname.
   */
  getAttackCompleteEventName() {
    return (
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
      (this.activeAttackAnimationKey ?? BULLDOG_ANIMATION_KEYS.biteAttack)
    );
  }

  /**
   * Meldet genau einen Treffer im letzten Angriffsframe.
   * @param {Phaser.Physics.Arcade.Sprite} target - Angegriffener Gegner.
   * @param {number} hitRange - Maximale horizontale Trefferentfernung.
   * @param {number} groundTolerance - Erlaubter Abstand der Fußpunkte.
   * @returns {boolean} `true`, wenn der Angriff den Gegner neu trifft.
   */
  consumeAttackHit(target, hitRange, groundTolerance) {
    if (!this.isAttackImpactReady(target)) return false;
    const distanceX = target.x - this.x;
    if (!this.isTargetInAttackRange(
      target,
      distanceX,
      hitRange,
      groundTolerance,
    ))
      return false;
    this.attackHitConsumed = true;
    return true;
  }

  /**
   * Prüft Angriffsstatus, Zielzustand und aktiven Trefferframe.
   * @param {Phaser.Physics.Arcade.Sprite} target - Angegriffener Gegner.
   * @returns {boolean} `true`, wenn eine Trefferprüfung sinnvoll ist.
   */
  isAttackImpactReady(target) {
    const attackKey = this.anims.currentAnim?.key;
    const texture = BULLDOG_ATTACK_TEXTURES[attackKey];
    return (
      this.isAttacking &&
      !this.attackHitConsumed &&
      Boolean(target?.active && target.body?.enable) &&
      Boolean(texture) &&
      this.anims.currentFrame?.textureFrame === texture.frameCount - 1
    );
  }

  /**
   * Prüft Blickrichtung, Reichweite und Höhenabstand des Angriffsziels.
   * @param {Phaser.Physics.Arcade.Sprite} target - Angegriffener Gegner.
   * @param {number} distanceX - Horizontaler Abstand zum Ziel.
   * @param {number} hitRange - Maximale horizontale Trefferentfernung.
   * @param {number} groundTolerance - Erlaubter Abstand der Fußpunkte.
   * @returns {boolean} `true`, wenn das Ziel getroffen werden darf.
   */
  isTargetInAttackRange(target, distanceX, hitRange, groundTolerance) {
    const facingDirection = this.flipX ? -1 : 1;
    const feetDistance = Math.abs(this.body.bottom - target.body.bottom);
    return (
      distanceX * facingDirection >= 0 &&
      Math.abs(distanceX) <= hitRange &&
      feetDistance <= groundTolerance
    );
  }

  /**
   * Beendet den Angriffszustand und stellt die neutrale Haltung wieder her.
   * @returns {void}
   */
  finishAttack() {
    if (!this.isAttacking) return;

    this.isAttacking = false;
    this.attackHitConsumed = false;
    this.activeAttackAnimationKey = null;
    this.showStandFrame();
  }

  /**
   * Zeigt nach einem normalen Gegnertreffer kurz den ersten K.-o.-Frame.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {boolean} `true`, wenn die Trefferreaktion gestartet wurde.
   */
  takeHit(time) {
    if (this.isKnockedOut || this.isHit) return false;

    this.audio.stopAll();
    this.isHit = true;
    this.hitReactionEndsAt = time + BULLDOG_ANIMATION_TIMING.hitReactionMs;
    this.cancelActiveActionStates();
    this.setVelocityX(0);
    this.anims.stop();
    this.setTexture(this.getKnockOutTexture().key, 0);
    return true;
  }

  /**
   * Beendet die kurze Trefferreaktion und stellt den Standframe wieder her.
   * @returns {void}
   */
  finishHitReaction() {
    if (!this.isHit) return;

    this.isHit = false;
    this.showStandFrame();
  }

  /**
   * Sperrt die Steuerung und spielt die K.-o.-Sequenz genau einmal ab.
   * @returns {boolean} `true`, wenn der K.-o.-Zustand neu ausgelöst wurde.
   */
  knockOut() {
    if (this.isKnockedOut) return false;

    this.audio.stopAll();
    this.isKnockedOut = true;
    this.isHit = false;
    this.cancelActiveActionStates();
    this.setVelocity(0, 0);
    this.setGravityY(0);
    this.anims.stop();
    this.play(this.getKnockOutAnimationKey());
    this.emit(BULLDOG_EVENTS.knockedOut);
    return true;
  }

  /**
   * Beendet gemeinsam genutzte Warte-, Lande- und Angriffszustände.
   * @returns {void}
   */
  cancelActiveActionStates() {
    this.standingStartedAt = null;
    this.isLanding = false;
    this.isAttacking = false;
    this.attackHitConsumed = false;
    Object.keys(BULLDOG_ATTACK_TEXTURES).forEach((animationKey) => {
      this.off(
        Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animationKey,
      );
    });
    this.activeAttackAnimationKey = null;
  }

  /**
   * Registriert eine einmalige Aktion nach dem letzten K.-o.-Frame.
   * @param {Function} callback - Aktion nach Abschluss der Animation.
   * @returns {void}
   */
  onceKnockOutComplete(callback) {
    [
      BULLDOG_ANIMATION_KEYS.knockout,
      BULLDOG_ANIMATION_KEYS.mutationKnockout,
    ].forEach((animationKey) => {
      const eventName =
        Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animationKey;
      this.once(eventName, callback);
    });
  }

  /**
   * Liefert die zur aktuellen Form passende K.-o.-Animation.
   * @returns {string} Phaser-Animationsschlüssel.
   */
  getKnockOutAnimationKey() {
    return this.isMutated
      ? BULLDOG_ANIMATION_KEYS.mutationKnockout
      : BULLDOG_ANIMATION_KEYS.knockout;
  }

  /**
   * Liefert die zur aktuellen Form passende K.-o.-Textur.
   * @returns {{key: string}} Konfiguration der K.-o.-Textur.
   */
  getKnockOutTexture() {
    return this.isMutated
      ? BULLDOG_TEXTURES.mutationKnockout
      : BULLDOG_TEXTURES.knockout;
  }

  /**
   * Stellt den neutralen Standframe ohne laufende Animation dar.
   * @returns {void}
   */
  showStandFrame() {
    this.stopWaitBreathing();
    if (this.isMutated) {
      this.play(BULLDOG_ANIMATION_KEYS.mutationIdle, true);
      return;
    }
    this.setTexture(BULLDOG_TEXTURES.stand.key, 0);
  }

  /**
   * Startet die Atemschleife genau einmal beim aktiven Wartezustand.
   * @returns {void}
   */
  startWaitBreathing() {
    this.audio.startWaitBreathing();
  }

  /**
   * Beendet die Atemschleife unmittelbar bei Bewegung oder einer Aktion.
   * @returns {void}
   */
  stopWaitBreathing() {
    this.audio.stopWaitBreathing();
  }

  /**
   * Prüft, ob die Bulldogge auf einer Kollisionsfläche steht.
   * @returns {boolean} `true`, wenn ein Sprung erlaubt ist.
   */
  isGrounded() {
    return this.body.blocked.down || this.body.touching.down;
  }
}
