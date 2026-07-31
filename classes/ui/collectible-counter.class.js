import Phaser from "phaser";
import { HUD } from "../../js/config/hud-settings.js";

/**
 * Zeigt einen einzelnen Sammelzähler in einem grafischen HUD-Rahmen.
 */
export class CollectibleCounter extends Phaser.GameObjects.Container {
  /**
   * Erstellt einen kamerafesten Zähler für eine Objektart.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {string} key - Schlüssel des Sammelobjekts.
   * @param {{x: number, y: number, width: number, height: number,
   * textX: number, textY: number, textureKey: string}} settings - Darstellung.
   * @param {import("../systems/collectible-system.class.js").CollectibleSystem} system - Zählerdaten.
   */
  constructor(scene, key, settings, system) {
    super(scene, settings.x, settings.y);
    scene.add.existing(this);
    this.key = key;
    const frame = this.createFrame(scene, settings);
    this.valueText = this.createValueText(scene, settings);
    this.add([frame, this.valueText]);
    this.setScrollFactor(0).setDepth(HUD.depth);
    this.bindSystem(system);
  }

  /**
   * Erstellt den Rahmen des Sammelzählers.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {object} settings - Zentrale Darstellungswerte.
   * @returns {Phaser.GameObjects.Image} Rahmenbild.
   */
  createFrame(scene, settings) {
    return scene.add.image(0, 0, settings.textureKey)
      .setOrigin(0)
      .setDisplaySize(settings.width, settings.height);
  }

  /**
   * Erstellt den Zahlenwert im Sammelrahmen.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {object} settings - Zentrale Darstellungswerte.
   * @returns {Phaser.GameObjects.Text} Textobjekt des Zählers.
   */
  createValueText(scene, settings) {
    return scene.add.text(
      settings.textX,
      settings.textY,
      "0",
      HUD.collectibleTextStyle,
    ).setOrigin(0.5);
  }

  /**
   * Reagiert nur auf Änderungen der zugehörigen Sammelobjektart.
   * @param {import("../systems/collectible-system.class.js").CollectibleSystem} system - Zählerdaten.
   * @returns {void}
   */
  bindSystem(system) {
    const unsubscribe = system.onChange((changedKey, count) => {
      if (changedKey === this.key) {
        this.valueText.setText(String(count));
      }
    });
    this.once("destroy", unsubscribe);
  }
}
