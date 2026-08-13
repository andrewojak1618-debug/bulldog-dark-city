import { EnemyHealthBar } from "../ui/enemy-health-bar.class.js";
import { DOG_CATCHER } from "../../js/config/dog-catcher-settings.js";
import { MUTANT_CAT } from "../../js/config/mutant-cat-settings.js";

/**
 * Manages enemy health bar system behavior.
 */
export class EnemyHealthBarSystem {
  /**
   * Handles attach dog catchers.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Group} group - The Phaser group to process.
   * @returns {EnemyHealthBar[]} The resulting collection.
   */
  static attachDogCatchers(scene, group) {
    return group.getChildren().map((enemy) => this.attach(
      scene,
      enemy,
      DOG_CATCHER.biteHitsToDefeat,
      () => DOG_CATCHER.biteHitsToDefeat - enemy.receivedBiteHits,
    ));
  }

  /**
   * Handles attach mutant cats.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat[]} cats - The cats value.
   * @returns {EnemyHealthBar[]} The resulting collection.
   */
  static attachMutantCats(scene, cats) {
    return cats.map((cat) => this.attach(
      scene,
      cat,
      MUTANT_CAT.biteHitsToDefeat,
      () => MUTANT_CAT.biteHitsToDefeat - cat.receivedBiteHits,
    ));
  }

  /**
   * Handles attach drones.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite[]} drones - The drones value.
   * @returns {EnemyHealthBar[]} The resulting collection.
   */
  static attachDrones(scene, drones) {
    return drones.map((drone) => {
      const maximum = drone.getData("drone").hitPoints;
      return this.attach(
        scene,
        drone,
        maximum,
        () => drone.getData("hitPoints"),
      );
    });
  }

  /**
   * Handles attach.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.GameObject} target - The target game object.
   * @param {number} maximum - The maximum value.
   * @param {() => number} getCurrent - The get current value.
   * @returns {EnemyHealthBar} The resulting value.
   */
  static attach(scene, target, maximum, getCurrent) {
    const healthBar = new EnemyHealthBar(
      scene,
      target,
      maximum,
      getCurrent,
    );
    target.setData("healthBar", healthBar);
    return healthBar;
  }
}
