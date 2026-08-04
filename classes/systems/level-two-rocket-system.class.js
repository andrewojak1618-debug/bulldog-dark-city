import Phaser from "phaser";
import { LEVEL_TWO } from "../../js/config/level-two-settings.js";

/**
 * Steuert die ausweichbaren Raketen der großen Alarmdrohne.
 */
export class LevelTwoRocketSystem {
  /**
   * Lädt Flug- und Explosionsspritesheet.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @returns {void}
   */
  static load(scene) {
    const settings = LEVEL_TWO.drones.rocket;
    scene.load.spritesheet(settings.key, settings.path, {
      frameWidth: settings.frameWidth,
      frameHeight: settings.frameHeight,
    });
    scene.load.spritesheet(settings.explosionKey, settings.explosionPath, {
      frameWidth: settings.frameWidth,
      frameHeight: settings.frameHeight,
    });
  }

  /**
   * Erstellt eine abgeschlossene Raketensteuerung für die Szene.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.GameObjects.Sprite[]} drones - Aktive Drohnen.
   * @param {Phaser.Physics.Arcade.Sprite} player - Steuerbare Bulldogge.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Trefferflächen.
   * @param {import("./health-system.class.js").HealthSystem} health - Lebenspunkte.
   */
  constructor(scene, drones, player, platforms, health) {
    this.scene = scene;
    this.drones = drones;
    this.player = player;
    this.platforms = platforms;
    this.health = health;
    this.projectiles = scene.physics.add.group();
    this.initializeState();
    this.registerAnimations();
    this.bindCollisions();
  }

  /**
   * Initialisiert alle zeit- und trefferabhängigen Zustände.
   * @returns {void}
   */
  initializeState() {
    this.nextShotAt = 0;
    this.wasBigDroneAlert = false;
    this.playerKnockedOut = false;
  }

  /**
   * Verbindet Raketen mit Plattformen und Spielfigur.
   * @returns {void}
   */
  bindCollisions() {
    this.scene.physics.add.collider(
      this.projectiles,
      this.platforms,
      (first, second) => this.explode(
        this.resolveProjectile(first, second),
      ),
    );
    this.scene.physics.add.overlap(
      this.projectiles,
      this.player,
      (first, second) => this.hitPlayer(
        this.resolveProjectile(first, second),
      ),
    );
  }

  /**
   * Registriert beide Animationen genau einmal.
   * @returns {void}
   */
  registerAnimations() {
    this.registerFlightAnimation();
    this.registerExplosionAnimation();
  }

  /**
   * Registriert die wiederholte Fluganimation genau einmal.
   * @returns {void}
   */
  registerFlightAnimation() {
    const settings = LEVEL_TWO.drones.rocket;
    if (this.scene.anims.exists(settings.animationKey)) return;
    this.scene.anims.create({
      key: settings.animationKey,
      frames: this.scene.anims.generateFrameNumbers(
        settings.key,
        { start: 0, end: 3 },
      ),
      frameRate: settings.frameRate,
      repeat: -1,
    });
  }

  /**
   * Registriert die einmalige Explosion genau einmal.
   * @returns {void}
   */
  registerExplosionAnimation() {
    const settings = LEVEL_TWO.drones.rocket;
    if (this.scene.anims.exists(settings.explosionAnimationKey)) return;
    this.scene.anims.create({
      key: settings.explosionAnimationKey,
      frames: this.scene.anims.generateFrameNumbers(
        settings.explosionKey,
        { start: 1, end: 3 },
      ),
      frameRate: settings.explosionFrameRate,
      repeat: 0,
    });
  }

  /**
   * Feuert während des Alarms in fairen Zeitabständen auf die aktuelle Position.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {boolean} `true`, wenn der Treffer die Bulldogge K.O. gesetzt hat.
   */
  update(time) {
    if (this.playerKnockedOut) return true;
    const bigDrone = this.drones.find((drone) =>
      drone.getData("drone")?.tracksPlayerWithBeam,
    );
    const isAlert = Boolean(bigDrone?.getData("isAlert"));

    if (isAlert && !this.wasBigDroneAlert) {
      this.nextShotAt = time + LEVEL_TWO.drones.rocket.firstShotDelayMs;
    }
    this.wasBigDroneAlert = isAlert;
    if (!isAlert || time < this.nextShotAt) return false;

    this.fire(bigDrone);
    this.nextShotAt = time + LEVEL_TWO.drones.rocket.cooldownMs;
    return false;
  }

  /**
   * Erzeugt eine Rakete und richtet ihre konstante Flugbahn auf die Bulldogge aus.
   * @param {Phaser.GameObjects.Sprite} drone - Abschießende große Drohne.
   * @returns {Phaser.Physics.Arcade.Sprite} Erzeugte Rakete.
   */
  fire(drone) {
    const settings = LEVEL_TWO.drones.rocket;
    const targetY = this.player.body?.center.y ?? this.player.y;
    const rocket = this.createRocket(drone, settings);
    const angle = Phaser.Math.Angle.Between(
      rocket.x,
      rocket.y,
      this.player.x,
      targetY,
    );

    this.launchRocket(rocket, angle, settings);
    return rocket;
  }

  /**
   * Erzeugt die Rakete am Abschusspunkt der großen Drohne.
   * @param {Phaser.GameObjects.Sprite} drone - Abschießende Drohne.
   * @param {object} settings - Zentrale Raketenkonfiguration.
   * @returns {Phaser.Physics.Arcade.Sprite} Neue Rakete.
   */
  createRocket(drone, settings) {
    return this.projectiles.create(
      drone.x,
      drone.y + settings.muzzleOffsetY,
      settings.key,
      0,
    );
  }

  /**
   * Konfiguriert Darstellung, Hitbox und konstante Geschwindigkeit.
   * @param {Phaser.Physics.Arcade.Sprite} rocket - Neue Rakete.
   * @param {number} angle - Flugwinkel zum Zielpunkt.
   * @param {object} settings - Zentrale Raketenkonfiguration.
   * @returns {void}
   */
  launchRocket(rocket, angle, settings) {
    rocket
      .setScale(settings.rocketScale)
      .setDepth(settings.depth)
      .setRotation(angle - Math.PI)
      .play(settings.animationKey);
    rocket.body.setCircle(
      settings.bodyRadius,
      settings.bodyOffsetX,
      settings.bodyOffsetY,
    );
    this.scene.physics.velocityFromRotation(
      angle,
      settings.speed,
      rocket.body.velocity,
    );
  }

  /**
   * Zieht bei einem direkten Treffer einmalig zehn Lebenspunkte ab.
   * @param {Phaser.Physics.Arcade.Sprite} rocket - Treffende Rakete.
   * @returns {void}
   */
  hitPlayer(rocket) {
    if (!rocket?.active || rocket.getData("isExploding")) return;
    const remainingHealth = this.health.takeDamage(
      LEVEL_TWO.drones.rocket.damage,
    );
    this.playerKnockedOut = remainingHealth <= 0;
    if (this.playerKnockedOut) {
      this.player.knockOut();
    } else {
      this.player.takeHit(this.scene.time.now);
    }
    this.explode(rocket);
  }

  /**
   * Ermittelt die Rakete unabhängig von der Phaser-Callback-Reihenfolge.
   * @param {Phaser.GameObjects.GameObject} first - Erstes Kollisionsobjekt.
   * @param {Phaser.GameObjects.GameObject} second - Zweites Kollisionsobjekt.
   * @returns {Phaser.Physics.Arcade.Sprite|undefined} Beteiligte Rakete.
   */
  resolveProjectile(first, second) {
    const projectiles = this.projectiles.getChildren();
    return projectiles.includes(first) ? first :
      projectiles.includes(second) ? second : undefined;
  }

  /**
   * Ersetzt eine Rakete am Kontaktpunkt durch die einmalige Explosion.
   * @param {Phaser.Physics.Arcade.Sprite} rocket - Auftreffende Rakete.
   * @returns {void}
   */
  explode(rocket) {
    if (!rocket?.active || rocket.getData("isExploding")) return;
    rocket.setData("isExploding", true);
    const { x, y } = rocket;
    rocket.destroy();
    const settings = LEVEL_TWO.drones.rocket;
    const explosion = this.scene.add
      .sprite(x, y, settings.explosionKey, 1)
      .setScale(settings.explosionScale)
      .setDepth(settings.depth)
      .play(settings.explosionAnimationKey);
    explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      explosion.destroy();
    });
  }
}
