import { EnemyHealthBar } from "../ui/enemy-health-bar.class.js";
import { DOG_CATCHER } from "../../js/config/dog-catcher-settings.js";
import { MUTANT_CAT } from "../../js/config/mutant-cat-settings.js";

/** Verbindet Gegnerarten mit der gemeinsamen Welt-Lebensanzeige. */
export class EnemyHealthBarSystem {
  /**
   * Ergänzt jeden Hundefänger um seine vier Trefferpunkte.
   * @param {Phaser.Scene} scene - Aktive Level-1-Szene.
   * @param {Phaser.GameObjects.Group} group - Hundefängergruppe.
   * @returns {EnemyHealthBar[]} Erstellte Anzeigen.
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
   * Ergänzt jede mutierte Katze um ihre neun Trefferpunkte.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat[]}
   * cats - Gegner des Levels.
   * @returns {EnemyHealthBar[]} Erstellte Anzeigen.
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
   * Ergänzt große und kleine Drohne anhand ihrer jeweiligen Trefferpunkte.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.GameObjects.Sprite[]} drones - Beide Leveldrohnen.
   * @returns {EnemyHealthBar[]} Erstellte Anzeigen.
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
   * Erstellt eine Anzeige und hinterlegt sie am zugehörigen Gegner.
   * @param {Phaser.Scene} scene - Aktive Spielszene.
   * @param {Phaser.GameObjects.GameObject} target - Verfolgter Gegner.
   * @param {number} maximum - Maximale Trefferpunkte.
   * @param {() => number} getCurrent - Aktueller Lebenswert.
   * @returns {EnemyHealthBar} Erstellte Lebensanzeige.
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
