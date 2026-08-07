import { LevelTwoObstacleSystem } from "./level-two-obstacle-system.class.js";
import { LevelTwoDroneSystem } from "./level-two-drone-system.class.js";
import { LevelTwoDroneCombatSystem } from
  "./level-two-drone-combat-system.class.js";
import { MutantCatSystem } from "./mutant-cat-system.class.js";

/** Koordiniert den laufenden Gameplay-Ablauf des zweiten Levels. */
export class LevelTwoGameplaySystem {
  /** Aktualisiert Spieler, Gegner und vorbereiteten Levelabschluss. */
  static update(scene, time, delta) {
    if (this.shouldPauseGameplay(scene)) return;
    if (this.resolveLevelExit(scene)) return;
    scene.mutationSystem?.update(scene.inputSystem);
    this.updatePlayerAndDrones(scene, time, delta);
    if (this.resolveRocketAttack(scene, time)) return;
    if (this.resolveCatAttack(scene, time)) return;
    this.unlockExit(scene);
  }

  /** Führt den automatischen Auslauf aus und startet anschließend Level drei. */
  static resolveLevelExit(scene) {
    if (scene.levelExit?.update(scene.player)) {
      scene.completeLevel();
      return true;
    }
    return Boolean(scene.levelExit?.isTransitioning);
  }

  /** Stoppt den normalen Ablauf während Einstieg oder Gefangennahme. */
  static shouldPauseGameplay(scene) {
    if (scene.captureSystem?.isActive) {
      scene.captureSystem.update();
      return true;
    }
    return scene.updateLevelEntry();
  }

  /** Aktualisiert Plattformkontakt, Spielfigur und beide Drohnensysteme. */
  static updatePlayerAndDrones(scene, time, delta) {
    LevelTwoObstacleSystem.updatePlayerPlatformContact(
      scene.player,
      scene.floatingLightPlatforms,
    );
    scene.player?.updateMovement(scene.inputSystem, time);
    LevelTwoDroneSystem.update(scene.drones, scene.player, delta);
    LevelTwoDroneCombatSystem.update(scene.drones, scene.player);
  }

  /** Startet nach einem tödlichen Raketentreffer die Fangsequenz. */
  static resolveRocketAttack(scene, time) {
    if (!scene.rocketSystem.update(time)) return false;
    scene.captureSystem.start(scene.player, scene.mutantCats);
    return true;
  }

  /** Startet nach einem tödlichen Katzenangriff die Fangsequenz. */
  static resolveCatAttack(scene, time) {
    const wasKnockedOut = MutantCatSystem.update(
      scene.mutantCats,
      scene.player,
      scene.healthSystem,
      time,
    );
    if (!wasKnockedOut) return false;
    scene.captureSystem.start(scene.player, scene.mutantCats);
    return true;
  }

  /** Öffnet den Level-3-Ausgang erst nach allen Level-2-Gegnern. */
  static unlockExit(scene) {
    if (scene.levelExit?.isUnlocked) return true;
    const allCatsDefeated = scene.mutantCats?.every((cat) => cat.isDead);
    const allDronesDefeated = scene.drones?.every((drone) =>
      drone.getData("isDestroyed")
    );
    if (!allCatsDefeated || !allDronesDefeated) return false;
    scene.levelExit.unlock();
    return true;
  }
}
