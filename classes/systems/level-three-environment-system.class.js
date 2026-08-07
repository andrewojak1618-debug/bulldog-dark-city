import { LEVEL_THREE } from "../../js/config/level-three-settings.js";

/** Lädt und erstellt die erste visuelle Ebene des dritten Levels. */
export class LevelThreeEnvironmentSystem {
  /** Lädt den vorbereiteten orangefarbenen Haupthintergrund. */
  static load(scene) {
    const background = LEVEL_THREE.background;
    scene.load.image(background.key, background.path);
  }

  /** Erstellt einen kamerafesten und vollständig gefüllten Hintergrund. */
  static create(scene) {
    const background = LEVEL_THREE.background;
    return scene.add.image(0, 0, background.key)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDisplaySize(scene.scale.width, scene.scale.height)
      .setDepth(background.depth);
  }
}
