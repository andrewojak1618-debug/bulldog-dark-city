import Phaser from "phaser";
import { THROW_BONES } from "../../js/config/throw-bone-settings.js";
import { RobotCatCombatSystem } from "./robot-cat-combat-system.class.js";
import { ThrowBoneInventory } from "./throw-bone-inventory.class.js";
import { ThrowBoneHud } from "../ui/throw-bone-hud.class.js";

/** Lädt, sammelt und wirft die beiden Knochenarten in Level drei. */
export class ThrowBoneSystem {
  /**
   * Lädt beide vorbereiteten Wurfknochen-Spritesheets.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static load(scene) {
    Object.values(THROW_BONES.types).forEach((type) => {
      scene.load.spritesheet(type.key, type.path, {
        frameWidth: type.frameWidth,
        frameHeight: type.frameHeight,
      });
    });
  }

  /**
   * Erstellt Pickups, Inventar, Eingaben und Projektilgruppe.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {Phaser.Physics.Arcade.Sprite} player - Steuerbare Bulldogge.
   * @param {Phaser.GameObjects.Sprite} robotCat - Ziel der Wurfknochen.
   * @param {import("./health-system.class.js").HealthSystem} robotCatHealth - Bossleben.
   * @param {import("../input/input-system.class.js").InputSystem} input - Spielereingaben.
   * @returns {ThrowBoneSystem} Vollständig erstelltes Wurfknochensystem.
   */
  static create(scene, player, robotCat, robotCatHealth, input) {
    this.registerAnimations(scene);
    const system = new ThrowBoneSystem(
      scene,
      player,
      robotCat,
      robotCatHealth,
      input,
    );
    system.createPickups();
    return system;
  }

  /**
   * Registriert die vier Frames jeder Knochenart als Endlosschleife.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static registerAnimations(scene) {
    Object.values(THROW_BONES.types).forEach((type) => {
      if (scene.anims.exists(type.animationKey)) return;
      scene.anims.create({
        key: type.animationKey,
        frames: scene.anims.generateFrameNumbers(type.key, {
          start: 0,
          end: type.frameCount - 1,
        }),
        frameRate: type.frameRate,
        repeat: -1,
      });
    });
  }

  /**
   * Speichert Szenenreferenzen und bindet die beiden Wurftasten.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {Phaser.Physics.Arcade.Sprite} player - Steuerbare Bulldogge.
   * @param {Phaser.GameObjects.Sprite} robotCat - Ziel der Wurfknochen.
   * @param {import("./health-system.class.js").HealthSystem} robotCatHealth - Bossleben.
   * @param {import("../input/input-system.class.js").InputSystem} input - Spielereingaben.
   */
  constructor(scene, player, robotCat, robotCatHealth, input) {
    this.scene = scene;
    this.player = player;
    this.robotCat = robotCat;
    this.robotCatHealth = robotCatHealth;
    this.input = input;
    this.inventory = new ThrowBoneInventory(Object.keys(THROW_BONES.types));
    this.hud = new ThrowBoneHud(scene, this.inventory);
    this.pickups = scene.physics.add.group({ allowGravity: false });
    this.projectiles = scene.physics.add.group({ allowGravity: false });
    this.keys = scene.input.keyboard?.addKeys({ normal: "K", nuclear: "L" });
  }

  /**
   * Setzt alle konfigurierten Knochen als animierte Pickups ins Level.
   * @returns {void}
   */
  createPickups() {
    THROW_BONES.placements.forEach((placement) => {
      const settings = THROW_BONES.types[placement.type];
      const pickup = this.pickups.create(
        placement.x,
        placement.y,
        settings.key,
      ).setDisplaySize(THROW_BONES.pickupSize, THROW_BONES.pickupSize)
        .setDepth(THROW_BONES.depth)
        .setData("boneType", placement.type)
        .play(settings.animationKey);
      pickup.body.setAllowGravity(false).setImmovable(true);
    });
    this.scene.physics.add.overlap(
      this.player,
      this.pickups,
      (_player, pickup) => this.collect(pickup),
    );
  }

  /**
   * Überträgt ein berührtes Pickup genau einmal in den Vorrat.
   * @param {Phaser.Physics.Arcade.Sprite} pickup - Berührter Wurfknochen.
   * @returns {boolean} Ob das Pickup eingesammelt wurde.
   */
  collect(pickup) {
    if (!pickup.active) return false;
    const type = pickup.getData("boneType");
    if (!this.inventory.collect(type)) return false;
    pickup.disableBody(true, true);
    return true;
  }

  /**
   * Verarbeitet neue Wurfeingaben und aktualisiert aktive Projektile.
   * @returns {void}
   */
  update() {
    if (this.shouldThrow("normal")) this.throw("normal");
    if (this.shouldThrow("nuclear")) this.throw("nuclear");
    this.updateProjectiles();
  }

  /**
   * Vereint Tastatur- und Touchimpulse einer Knochenart.
   * @param {"normal"|"nuclear"} type - Gewählte Knochenart.
   * @returns {boolean} Ob ein neuer Wurf ausgelöst wurde.
   */
  shouldThrow(type) {
    const touchTriggered = this.input?.consumeThrow(type) ?? false;
    const key = this.keys?.[type];
    const keyboardTriggered = key && Phaser.Input.Keyboard.JustDown(key);
    return Boolean(touchTriggered || keyboardTriggered);
  }

  /**
   * Erzeugt nach erfolgreichem Verbrauch einen gerichteten Wurfknochen.
   * @param {string} type - Zu werfende Knochenart.
   * @returns {boolean} Ob ein Projektil erzeugt wurde.
   */
  throw(type) {
    if (!this.inventory.consume(type)) return false;
    const settings = THROW_BONES.types[type];
    const direction = this.player.flipX ? -1 : 1;
    const projectile = this.projectiles.create(
      this.player.x + direction * 36,
      this.player.y - 28,
      settings.key,
    ).setDisplaySize(THROW_BONES.projectileSize, THROW_BONES.projectileSize)
      .setDepth(THROW_BONES.depth)
      .setVelocityX(direction * THROW_BONES.projectileSpeed)
      .setData({
        boneType: type,
        damage: settings.damage,
        expiresAt: this.scene.time.now + THROW_BONES.projectileLifetimeMs,
      })
      .play(settings.animationKey);
    projectile.body.setAllowGravity(false);
    return true;
  }

  /**
   * Entfernt abgelaufene Würfe oder leitet Boss-Treffer weiter.
   * @returns {void}
   */
  updateProjectiles() {
    this.projectiles.getChildren().forEach((projectile) => {
      if (!projectile.active) return;
      if (this.scene.time.now >= projectile.getData("expiresAt")) {
        projectile.destroy();
        return;
      }
      if (!this.hitsRobotCat(projectile)) return;
      RobotCatCombatSystem.applyDamage(
        this.robotCat,
        this.robotCatHealth,
        projectile.getData("damage"),
      );
      projectile.destroy();
    });
  }

  /**
   * Prüft die rechteckige Treffernähe zwischen Projektil und Roboterkatze.
   * @param {Phaser.Physics.Arcade.Sprite} projectile - Aktiver Wurfknochen.
   * @returns {boolean} Ob das Projektil den Boss berührt.
   */
  hitsRobotCat(projectile) {
    if (!this.robotCat?.active) return false;
    return (
      Math.abs(projectile.x - this.robotCat.x) <= THROW_BONES.hitRangeX &&
      Math.abs(projectile.y - this.robotCat.y) <= THROW_BONES.hitRangeY
    );
  }
}
