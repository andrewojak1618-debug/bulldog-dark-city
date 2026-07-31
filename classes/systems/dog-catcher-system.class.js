import { DogCatcher } from "../entities/enemies/dog-catcher.class.js";
import {
  DOG_CATCHER,
  DOG_CATCHER_TEXTURES,
} from "../../js/config/dog-catcher-settings.js";

/**
 * Verbindet Hundefänger, Levelphysik und Spielerschaden.
 */
export class DogCatcherSystem {
  /**
   * Lädt alle derzeit benötigten Hundefänger-Spritesheets.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @returns {void}
   */
  static load(scene) {
    Object.values(DOG_CATCHER_TEXTURES).forEach((texture) => {
      scene.load.spritesheet(texture.key, texture.path, {
        frameWidth: texture.frameWidth,
        frameHeight: texture.frameHeight,
      });
    });
  }

  /**
   * Erstellt die Gegnergruppe und verbindet sie mit den Plattformen.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Levelplattformen.
   * @returns {Phaser.GameObjects.Group} Gruppe der Hundefänger.
   */
  static create(scene, platforms) {
    const group = scene.add.group({ runChildUpdate: false });
    group.add(new DogCatcher(
      scene,
      DOG_CATCHER.spawnX,
      DOG_CATCHER.spawnY,
      DOG_CATCHER_TEXTURES.walk.key,
    ));
    scene.physics.add.collider(group, platforms);
    return group;
  }

  /**
   * Aktualisiert alle Gegner und verarbeitet jeden Treffer genau einmal.
   * @param {Phaser.GameObjects.Group} group - Gruppe der Hundefänger.
   * @param {Phaser.Physics.Arcade.Sprite} player - Angegriffene Bulldogge.
   * @param {import("./health-system.class.js").HealthSystem} health - Lebenspunkte.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  static update(group, player, health, time) {
    group?.getChildren().forEach((dogCatcher) => {
      dogCatcher.updateBehavior(player, time);
      if (!dogCatcher.consumeAttackHit(player)) return;

      const remainingHealth = health.takeDamage(DOG_CATCHER.attackDamage);
      if (remainingHealth === 0) player.knockOut();
    });
  }
}
