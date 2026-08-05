import { MutantCat } from "../entities/enemies/mutant-cat.class.js";
import { MutantCatAnimationSystem } from "./mutant-cat-animation-system.class.js";
import { MutantCatAudioSystem } from
  "./mutant-cat-audio-system.class.js";
import {
  MUTANT_CAT,
  MUTANT_CAT_ATTENTIVE_TEXTURE,
  MUTANT_CAT_ATTACK_TEXTURE,
  MUTANT_CAT_DEAD_TEXTURE,
  MUTANT_CAT_TEXTURE,
} from "../../js/config/mutant-cat-settings.js";

/** Verbindet die mutierte Katze mit Level-2-Physik und Animation. */
export class MutantCatSystem {
  /**
   * Lädt das vorbereitete Katzen-Spritesheet.
   * @param {Phaser.Scene} scene - Zugehörige Level-2-Szene.
   * @returns {void}
   */
  static load(scene) {
    [
      MUTANT_CAT_TEXTURE,
      MUTANT_CAT_ATTENTIVE_TEXTURE,
      MUTANT_CAT_ATTACK_TEXTURE,
      MUTANT_CAT_DEAD_TEXTURE,
    ].forEach((texture) => {
      scene.load.spritesheet(texture.key, texture.path, {
        frameWidth: texture.frameWidth,
        frameHeight: texture.frameHeight,
      });
    });
    MutantCatAudioSystem.load(scene);
  }

  /**
   * Erstellt die Katze und verbindet sie mit allen Levelplattformen.
   * @param {Phaser.Scene} scene - Zugehörige Level-2-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Levelplattformen.
   * @returns {MutantCat[]} Erstellte mutierte Katzen.
   */
  static create(scene, platforms) {
    MutantCatAnimationSystem.register(scene);
    return MUTANT_CAT.patrols.map((patrol) => {
      const cat = new MutantCat(
        scene,
        patrol.spawnX,
        MUTANT_CAT.spawnY,
        MUTANT_CAT_TEXTURE.key,
        patrol,
      );

      scene.physics.add.collider(cat, platforms);
      return cat;
    });
  }

  /**
   * Aktualisiert Verhalten und verarbeitet einen Angriffstreffer genau einmal.
   * @param {MutantCat[]} cats - Mutierte Katzen des Levels.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @param {import("./health-system.class.js").HealthSystem} health - Lebenspunkte.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {boolean} `true`, wenn dieser Treffer die Bulldogge K. o. setzt.
   */
  static update(cats, player, health, time) {
    let wasKnockedOut = false;

    cats.forEach((cat) => {
      cat?.updateBehavior(player, time);
      this.resolvePlayerBite(cat, player, time);
      if (wasKnockedOut || !cat?.consumeAttackHit(player)) return;
      wasKnockedOut = this.resolveCatAttack(player, health, time);
    });
    return wasKnockedOut;
  }

  /**
   * Leitet einen gültigen Biss genau einmal an die Katze weiter.
   * @param {MutantCat} cat - Mutierte Katze des Levels.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  static resolvePlayerBite(cat, player, time) {
    const wasHit = player?.consumeBiteHit(
      cat,
      MUTANT_CAT.biteHitRange,
      MUTANT_CAT.biteGroundLevelTolerance,
    );
    if (wasHit) cat.takeBiteHit(time);
  }

  /**
   * Zieht Lebenspunkte ab und startet Trefferreaktion oder K.-o.-Sequenz.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @param {import("./health-system.class.js").HealthSystem} health - Lebenspunkte.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {boolean} `true`, wenn der Angriff die Bulldogge K. o. setzt.
   */
  static resolveCatAttack(player, health, time) {
    const remainingHealth = health.takeDamage(MUTANT_CAT.attackDamage);
    if (remainingHealth === 0) {
      player.knockOut();
      return true;
    }
    player.takeHit(time);
    return false;
  }
}
