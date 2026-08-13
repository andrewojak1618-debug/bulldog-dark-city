import Phaser from "phaser";
import { THROW_BONES } from "../../js/config/throw-bone-settings.js";

/**
 * Manages throw bone hud behavior.
 */
export class ThrowBoneHud extends Phaser.GameObjects.Container {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {import("../systems/throw-bone-inventory.class.js").ThrowBoneInventory} inventory - The active inventory instance.
   */
  constructor(scene, inventory) {
    const settings = THROW_BONES.inventoryHud;
    super(scene, settings.x, settings.y);
    scene.add.existing(this);
    this.counts = { normal: 0, nuclear: 0 };
    this.normalRow = this.createRow(scene, "normal", 0, settings.normalColor);
    this.nuclearRow = this.createRow(scene, "nuclear", settings.rowGap,
      settings.nuclearColor);
    this.add([this.normalRow, this.nuclearRow]);
    this.setScrollFactor(0).setDepth(settings.depth).setVisible(false);
    this.bindInventory(inventory);
  }

  /**
   * Creates row.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {string} type - The requested item type.
   * @param {number} y - The vertical position.
   * @param {string} color - The color value.
   * @returns {Phaser.GameObjects.Container} The resulting data object.
   */
  createRow(scene, type, y, color) {
    const settings = THROW_BONES.inventoryHud;
    const bone = THROW_BONES.types[type];
    const row = scene.add.container(0, y).setVisible(false);
    const icon = this.createIcon(scene, bone, settings);
    const text = this.createCountText(scene, color, settings);
    row.add([icon, text]);
    row.setData("countText", text);
    return row;
  }

  /**
   * Creates one inventory icon.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} bone - The bone settings.
   * @param {object} settings - The HUD settings.
   * @returns {Phaser.GameObjects.Image} The bone icon.
   */
  createIcon(scene, bone, settings) {
    return scene.add.image(-64, 12, bone.key, 0)
      .setDisplaySize(settings.iconSize, settings.iconSize);
  }

  /**
   * Creates one inventory count label.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {string} color - The text color.
   * @param {object} settings - The HUD settings.
   * @returns {Phaser.GameObjects.Text} The count label.
   */
  createCountText(scene, color, settings) {
    return scene.add.text(0, 0, "", {
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      color,
      stroke: settings.stroke,
      strokeThickness: settings.strokeThickness,
    }).setOrigin(1, 0);
  }

  /**
   * Binds inventory.
   * @param {import("../systems/throw-bone-inventory.class.js").ThrowBoneInventory} inventory - The active inventory instance.
   * @returns {void} No value is returned.
   */
  bindInventory(inventory) {
    const unsubscribe = inventory.onChange((type, count) => {
      this.updateCount(type, count);
    });
    this.once("destroy", unsubscribe);
  }

  /**
   * Updates count.
   * @param {string} type - The requested item type.
   * @param {number} count - The count value.
   * @returns {void} No value is returned.
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
