import Phaser from "phaser";
import { THROW_BONES } from "../../js/config/throw-bone-settings.js";

/** Zeigt den Vorrat normaler und nuklearer Wurfknochen oben rechts an. */
export class ThrowBoneHud extends Phaser.GameObjects.Container {
  /**
   * Erstellt beide kamerafesten Zähler und bindet sie ans Inventar.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {import("../systems/throw-bone-inventory.class.js").ThrowBoneInventory} inventory - Knochenvorrat.
   */
  constructor(scene, inventory) {
    const settings = THROW_BONES.inventoryHud;
    super(scene, settings.x, settings.y);
    scene.add.existing(this);
    this.counts = { normal: 0, nuclear: 0 };
    this.normalRow = this.createRow(
      scene,
      "normal",
      0,
      settings.normalColor,
    );
    this.nuclearRow = this.createRow(
      scene,
      "nuclear",
      settings.rowGap,
      settings.nuclearColor,
    );
    this.add([this.normalRow, this.nuclearRow]);
    this.setScrollFactor(0).setDepth(settings.depth).setVisible(false);
    this.bindInventory(inventory);
  }

  /**
   * Erstellt eine Vorratszeile aus echtem Knochenframe und Zählertext.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {string} type - Dargestellte Knochenart.
   * @param {number} y - Vertikale Position innerhalb des HUDs.
   * @param {string} color - Textfarbe des Zählers.
   * @returns {Phaser.GameObjects.Container} Erstellte Vorratszeile.
   */
  createRow(scene, type, y, color) {
    const settings = THROW_BONES.inventoryHud;
    const bone = THROW_BONES.types[type];
    const row = scene.add.container(0, y).setVisible(false);
    const icon = scene.add.image(-64, 12, bone.key, 0)
      .setDisplaySize(settings.iconSize, settings.iconSize);
    const text = scene.add.text(0, 0, "", {
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      color,
      stroke: settings.stroke,
      strokeThickness: settings.strokeThickness,
    }).setOrigin(1, 0);
    row.add([icon, text]);
    row.setData("countText", text);
    return row;
  }

  /**
   * Verbindet die Anzeige mit den Änderungen des Knochenvorrats.
   * @param {import("../systems/throw-bone-inventory.class.js").ThrowBoneInventory} inventory - Knochenvorrat.
   * @returns {void}
   */
  bindInventory(inventory) {
    const unsubscribe = inventory.onChange((type, count) => {
      this.updateCount(type, count);
    });
    this.once("destroy", unsubscribe);
  }

  /**
   * Schaltet die betroffene Zeile und das gesamte Knochen-HUD passend um.
   * @param {string} type - Veränderte Knochenart.
   * @param {number} count - Aktuell verfügbare Anzahl.
   * @returns {void}
   */
  updateCount(type, count) {
    const row = type === "normal" ? this.normalRow : this.nuclearRow;
    if (!row) return;
    const key = THROW_BONES.types[type].inputKey;
    this.counts[type] = count;
    row.getData("countText").setText(`${key} × ${count}`);
    row.setVisible(count > 0);
    this.setVisible(Object.values(this.counts).some((value) => value > 0));
  }
}
