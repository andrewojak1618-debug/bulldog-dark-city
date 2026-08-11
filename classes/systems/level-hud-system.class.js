import { HealthBar } from "../ui/health-bar.class.js";
import { CollectibleCounter } from "../ui/collectible-counter.class.js";
import { MutationBar } from "../ui/mutation-bar.class.js";
import { MutationReadyPrompt } from "../ui/mutation-ready-prompt.class.js";
import { HealthSystem } from "./health-system.class.js";
import { CollectibleSystem } from "./collectible-system.class.js";
import { MutationSystem } from "./mutation-system.class.js";
import { COLLECTIBLE_KEYS, HUD } from "../../js/config/hud-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

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
      AssetLoaderSystem.loadImage(scene, {
        key: asset.textureKey,
        path: asset.path,
      });
    });
  }

  /**
   * Erstellt HUD-Daten und die drei sichtbaren Anzeigen.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {{health?: number, collectibles?: Record<string, number>}}
   * [initialState={}] - Optionaler Zustand des vorherigen Levels.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog|null}
   * [player=null] - Verwandelbare Spielfigur.
   * @returns {{health: HealthSystem, collectibles: CollectibleSystem,
   * mutation: MutationSystem}}
   * Veränderbare Leveldaten für Treffer und Sammelobjekte.
   */
  static create(scene, initialState = {}, player = null) {
    const health = this.createHealthSystem(initialState);
    const collectibles = this.createCollectibleSystem(initialState);
    const mutation = this.createMutationSystem(
      scene,
      health,
      collectibles,
      player,
    );
    return { health, collectibles, mutation };
  }

  /**
   * Erstellt die begrenzten Lebensdaten aus dem optionalen Levelzustand.
   * @param {object} initialState - Zustand des vorherigen Levels.
   * @returns {HealthSystem} Gemeinsame Lebensdaten.
   */
  static createHealthSystem(initialState) {
    const current = initialState.health ?? HUD.health.maximum;
    return new HealthSystem(HUD.health.maximum, current);
  }

  /**
   * Erstellt die bekannten Sammelstände aus dem optionalen Levelzustand.
   * @param {object} initialState - Zustand des vorherigen Levels.
   * @returns {CollectibleSystem} Gemeinsame Sammeldaten.
   */
  static createCollectibleSystem(initialState) {
    return new CollectibleSystem(
      Object.values(COLLECTIBLE_KEYS),
      initialState.collectibles,
    );
  }

  /**
   * Verbindet normale HUD-Elemente, Mutationsanzeige und Spielfigur.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {HealthSystem} health - Gemeinsame Lebensdaten.
   * @param {CollectibleSystem} collectibles - Gemeinsame Sammeldaten.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog|null}
   * player - Verwandelbare Spielfigur.
   * @returns {MutationSystem} Steuerung des Mutations-HUDs.
   */
  static createMutationSystem(scene, health, collectibles, player) {
    const healthBar = new HealthBar(scene, health);
    const counters = this.createCollectibleCounters(scene, collectibles);
    const mutationBar = new MutationBar(scene);
    const mutationReady = new MutationReadyPrompt(scene, collectibles);
    return new MutationSystem(
      scene,
      collectibles,
      [healthBar, ...counters, mutationReady],
      mutationBar,
      player,
    );
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
