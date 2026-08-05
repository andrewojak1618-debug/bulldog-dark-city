import { HealthBar } from "../ui/health-bar.class.js";
import { CollectibleCounter } from "../ui/collectible-counter.class.js";
import { MutationBar } from "../ui/mutation-bar.class.js";
import { MutationReadyPrompt } from "../ui/mutation-ready-prompt.class.js";
import { HealthSystem } from "./health-system.class.js";
import { CollectibleSystem } from "./collectible-system.class.js";
import { MutationSystem } from "./mutation-system.class.js";
import { COLLECTIBLE_KEYS, HUD } from "../../js/config/hud-settings.js";

/**
 * Lädt und erstellt die aktuell sichtbaren Anzeigen des Level-HUDs.
 */
export class LevelHudSystem {
  /**
   * Lädt nur die aktuell verwendeten HUD-Rahmen.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @returns {void}
   */
  static load(scene) {
    [HUD.health, HUD.coin, HUD.serum, HUD.mutation].forEach((asset) => {
      scene.load.image(asset.textureKey, asset.path);
    });
  }

  /**
   * Erstellt HUD-Daten und die drei sichtbaren Anzeigen.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {{health?: number, collectibles?: Record<string, number>}}
   * [initialState={}] - Optionaler Zustand des vorherigen Levels.
   * @returns {{health: HealthSystem, collectibles: CollectibleSystem,
   * mutation: MutationSystem}}
   * Veränderbare Leveldaten für Treffer und Sammelobjekte.
   */
  static create(scene, initialState = {}) {
    const health = new HealthSystem(
      HUD.health.maximum,
      initialState.health ?? HUD.health.maximum,
    );
    const collectibles = new CollectibleSystem(
      Object.values(COLLECTIBLE_KEYS),
      initialState.collectibles,
    );
    const healthBar = new HealthBar(scene, health);
    const counters = this.createCollectibleCounters(scene, collectibles);
    const mutationBar = new MutationBar(scene);
    const mutationReady = new MutationReadyPrompt(scene, collectibles);
    const mutation = new MutationSystem(
      scene,
      collectibles,
      [healthBar, ...counters, mutationReady],
      mutationBar,
    );
    return { health, collectibles, mutation };
  }

  /**
   * Erstellt Münz- und Serumzähler aus derselben UI-Komponente.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {CollectibleSystem} collectibles - Gemeinsame Zählerdaten.
   * @returns {CollectibleCounter[]} Erstellte Coin- und Serumanzeigen.
   */
  static createCollectibleCounters(scene, collectibles) {
    const coin = new CollectibleCounter(
      scene,
      COLLECTIBLE_KEYS.coins,
      HUD.coin,
      collectibles,
    );
    const serum = new CollectibleCounter(
      scene,
      COLLECTIBLE_KEYS.serum,
      HUD.serum,
      collectibles,
    );
    return [coin, serum];
  }
}
