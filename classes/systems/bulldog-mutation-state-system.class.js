import Phaser from "phaser";
import {
  BULLDOG_ANIMATION_KEYS,
  BULLDOG_ANIMATION_TIMING,
  BULLDOG_EVENTS,
  BULLDOG_TEXTURES,
} from "../../js/config/bulldog-animation-settings.js";
import { BULLDOG_GAMEPLAY } from
  "../../js/config/bulldog-gameplay-settings.js";

/** Steuert den Lebenszyklus der mutierten Bulldoggenform. */
export class BulldogMutationStateSystem {
  /**
   * Initialisiert sämtliche Mutationszustände ausdrücklich.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {void}
   */
  static initialize(player) {
    player.isMutating = false;
    player.isMutated = false;
    player.wasMutationAirborne = false;
    player.nextMutationAttackSide = "left";
    player.mutationFallbackEvent = null;
  }

  /**
   * Startet die Transformation und sperrt dabei die Steuerung.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {boolean} `true`, wenn die Transformation gestartet wurde.
   */
  static start(player) {
    if (!this.canStart(player)) return false;
    this.prepareTransformation(player);
    this.applyVisuals(player);
    this.registerCompletion(player);
    return true;
  }

  /**
   * Prüft, ob eine neue Transformation zulässig ist.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {boolean} `true`, wenn die Transformation starten darf.
   */
  static canStart(player) {
    return !player.isMutating && !player.isMutated && !player.isKnockedOut;
  }

  /** Prüft die Immunität der Mutation gegen gewöhnliche Schadensquellen. */
  static canReceiveNormalDamage(player) {
    return !player.isMutating && !player.isMutated;
  }

  /**
   * Bereitet Zustand, Bewegung und Transformationsanimation vor.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {void}
   */
  static prepareTransformation(player) {
    player.isMutating = true;
    player.cancelActiveActionStates();
    player.setVelocity(0, 0);
    player.play(BULLDOG_ANIMATION_KEYS.mutationTransform);
  }

  /**
   * Passt Darstellung und Hitbox bei gleichbleibendem Bodenkontakt an.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {void}
   */
  static applyVisuals(player) {
    const feetY = player.body.bottom;
    const settings = BULLDOG_GAMEPLAY.mutation;
    player.setDisplaySize(settings.displayWidth, settings.displayHeight);
    player.body.setSize(settings.bodyWidth, settings.bodyHeight)
      .setOffset(settings.bodyOffsetX, settings.bodyOffsetY);
    player.body.updateFromGameObject();
    player.y += feetY - player.body.bottom;
    player.body.updateFromGameObject();
  }

  /**
   * Registriert Animationsende und zeitliche Rückfallebene.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {void}
   */
  static registerCompletion(player) {
    player.once(this.getCompleteEventName(), () => this.finish(player));
    player.mutationFallbackEvent = player.scene.time.delayedCall(
      BULLDOG_ANIMATION_TIMING.mutationFallbackMs,
      () => this.finish(player),
    );
  }

  /**
   * Liefert den Ereignisnamen der abgeschlossenen Transformation.
   * @returns {string} Vollständiger Phaser-Ereignisname.
   */
  static getCompleteEventName() {
    return Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
      BULLDOG_ANIMATION_KEYS.mutationTransform;
  }

  /**
   * Schließt die Transformation genau einmal ab.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {void}
   */
  static finish(player) {
    if (!player.isMutating) return;
    this.clearTransition(player, this.getCompleteEventName());
    player.isMutating = false;
    player.isMutated = true;
    player.play(BULLDOG_ANIMATION_KEYS.mutationIdle);
    player.emit(BULLDOG_EVENTS.mutationCompleted);
  }

  /** Startet die rückwärts abgespielte Rückverwandlung. */
  static revert(player) {
    if (!player.isMutated || player.isMutating || player.isKnockedOut) {
      return false;
    }
    player.isMutating = true;
    player.cancelActiveActionStates();
    player.setVelocity(0, 0);
    player.play(BULLDOG_ANIMATION_KEYS.mutationRevert);
    this.registerReversionCompletion(player);
    return true;
  }

  /** Registriert Animationsende und Rückfallebene der Rückverwandlung. */
  static registerReversionCompletion(player) {
    const eventName = this.getRevertCompleteEventName();
    player.once(eventName, () => this.finishReversion(player));
    player.mutationFallbackEvent = player.scene.time.delayedCall(
      BULLDOG_ANIMATION_TIMING.mutationFallbackMs,
      () => this.finishReversion(player),
    );
  }

  /** Liefert den vollständigen Ereignisnamen der Rückverwandlung. */
  static getRevertCompleteEventName() {
    return Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
      BULLDOG_ANIMATION_KEYS.mutationRevert;
  }

  /** Stellt nach der Rückverwandlung Form, Hitbox und Standbild wieder her. */
  static finishReversion(player) {
    if (!player.isMutating || !player.isMutated) return;
    this.clearTransition(player, this.getRevertCompleteEventName());
    player.isMutating = false;
    player.isMutated = false;
    this.restoreNormalVisuals(player);
    player.emit(BULLDOG_EVENTS.mutationReverted);
  }

  /** Stellt normale Größe und Hitbox bei unverändertem Bodenkontakt her. */
  static restoreNormalVisuals(player) {
    const feetY = player.body.bottom;
    player.setTexture(BULLDOG_TEXTURES.stand.key, 0);
    player.setDisplaySize(
      BULLDOG_GAMEPLAY.displayWidth,
      BULLDOG_GAMEPLAY.displayHeight,
    );
    player.body.setSize(BULLDOG_GAMEPLAY.bodyWidth, BULLDOG_GAMEPLAY.bodyHeight)
      .setOffset(BULLDOG_GAMEPLAY.bodyOffsetX, BULLDOG_GAMEPLAY.bodyOffsetY);
    player.body.updateFromGameObject();
    player.y += feetY - player.body.bottom;
    player.body.updateFromGameObject();
  }

  /** Entfernt Listener und zeitliche Rückfallebene eines Formwechsels. */
  static clearTransition(player, eventName) {
    player.off(eventName);
    player.mutationFallbackEvent?.remove(false);
    player.mutationFallbackEvent = null;
  }

  /**
   * Liefert den nächsten normalen oder abwechselnden Mutationsangriff.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {string} Schlüssel der nächsten Angriffsanimation.
   */
  static getNextAttackAnimationKey(player) {
    if (!player.isMutated) return BULLDOG_ANIMATION_KEYS.biteAttack;
    const usesLeftArm = player.nextMutationAttackSide === "left";
    player.nextMutationAttackSide = usesLeftArm ? "right" : "left";
    return usesLeftArm
      ? BULLDOG_ANIMATION_KEYS.mutationAttackLeft
      : BULLDOG_ANIMATION_KEYS.mutationAttackRight;
  }
}
