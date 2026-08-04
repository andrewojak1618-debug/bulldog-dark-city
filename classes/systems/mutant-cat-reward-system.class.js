import { LevelItemSystem } from "./level-item-system.class.js";
import { MUTANT_CAT_EVENTS } from
  "../../js/config/mutant-cat-settings.js";
import { isFastMutantCatDefeat, MUTANT_CAT_REWARD } from
  "../../js/config/mutant-cat-reward-settings.js";

/** Wählt und erzeugt die zeitabhängige Belohnung der mutierten Katze. */
export class MutantCatRewardSystem {
  /**
   * Lädt Golden Coin, Aufnahmeeffekt und wiederverwendete Health-Items.
   * @param {Phaser.Scene} scene - Zugehörige Level-2-Szene.
   * @returns {void}
   */
  static load(scene) {
    LevelItemSystem.load(scene);
  }

  /**
   * Erstellt das Belohnungssystem und bindet es an die besiegte Katze.
   * @param {Phaser.Scene} scene - Zugehörige Level-2-Szene.
   * @param {Phaser.Physics.Arcade.Sprite} player - Sammelnde Bulldogge.
   * @param {import("./health-system.class.js").HealthSystem} health - Lebenspunkte.
   * @param {import("./collectible-system.class.js").CollectibleSystem} collectibles - Itemzähler.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat[]} cats -
   * Besiegbare Gegner.
   * @returns {MutantCatRewardSystem} Aktives Belohnungssystem.
   */
  static create(scene, player, health, collectibles, cats) {
    LevelItemSystem.registerAnimations(scene);
    const rewardSystem = new MutantCatRewardSystem(
      scene,
      player,
      health,
      collectibles,
    );
    rewardSystem.bindDefeats(cats);
    return rewardSystem;
  }

  /** Speichert die gemeinsamen Abhängigkeiten und richtet die Itemgruppe ein. */
  constructor(scene, player, health, collectibles) {
    this.scene = scene;
    this.group = scene.add.group({ runChildUpdate: false });
    this.rewardedCats = new WeakSet();
    LevelItemSystem.bindPickupOverlap(
      scene,
      player,
      this.group,
      health,
      collectibles,
    );
  }

  /**
   * Bindet die Belohnungslogik an jede Katze des Levels.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat[]} cats -
   * Besiegbare Katzen.
   * @returns {void}
   */
  bindDefeats(cats) {
    cats.forEach((cat) => this.bindDefeat(cat));
  }

  /**
   * Wartet einmalig auf das vollständige Ende der Katzen-Todesanimation.
   * @param {Phaser.GameObjects.Sprite} cat - Besiegbarer Katzengegner.
   * @returns {void}
   */
  bindDefeat(cat) {
    cat.once(MUTANT_CAT_EVENTS.defeated, (result) => {
      this.spawnReward(cat, result);
    });
  }

  /**
   * Erzeugt abhängig von der Kampfzeit Golden Coin oder zwei Health-Items.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat} cat -
   * Besiegte Katze.
   * @param {{x: number, y: number, elapsedMs: number}} result - Kampfergebnis.
   * @returns {void}
   */
  spawnReward(cat, result) {
    if (this.rewardedCats.has(cat)) return;
    this.rewardedCats.add(cat);

    if (isFastMutantCatDefeat(result.elapsedMs)) {
      this.spawnGoldenCoin(result);
      return;
    }
    this.spawnHealthItems(result);
  }

  /**
   * Erzeugt den Goldenen Coin für einen schnellen Sieg.
   * @param {{x: number, y: number}} result - Position der besiegten Katze.
   * @returns {void}
   */
  spawnGoldenCoin(result) {
    this.addItem(
      "goldenCoin",
      result.x,
      result.y,
      MUTANT_CAT_REWARD.goldenCoinSize,
    );
  }

  /**
   * Erzeugt zwei getrennt erreichbare Health-Items für einen langsamen Sieg.
   * @param {{x: number, y: number}} result - Position der besiegten Katze.
   * @returns {void}
   */
  spawnHealthItems(result) {
    const offsetX = MUTANT_CAT_REWARD.healthItemOffsetX;
    this.addItem("health", result.x - offsetX, result.y,
      MUTANT_CAT_REWARD.healthItemSize);
    this.addItem("health", result.x + offsetX, result.y,
      MUTANT_CAT_REWARD.healthItemSize);
  }

  /**
   * Fügt ein animiertes Item oberhalb der besiegten Katze zur Gruppe hinzu.
   * @param {string} type - Registrierter Itemtyp.
   * @param {number} x - Horizontale Drop-Position.
   * @param {number} y - Vertikale Katzenposition.
   * @param {number} size - Sichtbare quadratische Darstellungsgröße.
   * @returns {Phaser.Physics.Arcade.Sprite} Erzeugtes Sammelobjekt.
   */
  addItem(type, x, y, size) {
    const item = LevelItemSystem.createItem(this.scene, {
      type,
      x,
      y: y - MUTANT_CAT_REWARD.dropOffsetY,
      size,
    });
    this.group.add(item);
    return item;
  }
}
