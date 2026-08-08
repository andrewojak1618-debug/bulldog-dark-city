import {
  ROBOT_CAT,
  ROBOT_CAT_FLIGHT_TEXTURE,
  ROBOT_CAT_STATES,
  ROBOT_CAT_WALK_TEXTURE,
} from "../../js/config/robot-cat-settings.js";

/** Lädt, erstellt und steuert die Roboterkatze des dritten Levels. */
export class RobotCatSystem {
  /**
   * Lädt die vorbereiteten Lauf- und Flug-Spritesheets.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static load(scene) {
    [ROBOT_CAT_WALK_TEXTURE, ROBOT_CAT_FLIGHT_TEXTURE].forEach((texture) => {
      scene.load.spritesheet(texture.key, texture.path, {
        frameWidth: texture.frameWidth,
        frameHeight: texture.frameHeight,
      });
    });
  }

  /**
   * Erstellt die patrouillierende Roboterkatze auf der Laufebene.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Kollisionsgruppe.
   * @param {number} surfaceY - Gemeinsame Laufkante des Levels.
   * @returns {Phaser.GameObjects.Sprite} Erstellte Roboterkatze.
   */
  static create(scene, platforms, surfaceY) {
    const groundY = surfaceY + ROBOT_CAT.groundOffsetY;
    this.registerAnimations(scene);
    const collision = this.createCollision(scene, platforms, groundY);
    const robotCat = this.createSprite(scene, groundY);
    this.initializeMovementData(robotCat, collision, groundY);
    return robotCat;
  }

  /**
   * Erstellt die sichtbare Roboterkatze mit ihrer Laufanimation.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {number} groundY - Gemeinsame Bodenlinie der Figur.
   * @returns {Phaser.GameObjects.Sprite} Sichtbare Roboterkatze.
   */
  static createSprite(scene, groundY) {
    return scene.add.sprite(
      ROBOT_CAT.spawnX,
      groundY,
      ROBOT_CAT_WALK_TEXTURE.key,
      0,
    ).setOrigin(0.5, 1)
      .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight)
      .setDepth(ROBOT_CAT.depth)
      .play(ROBOT_CAT_WALK_TEXTURE.animationKey);
  }

  /**
   * Hinterlegt alle veränderlichen Bewegungswerte an der Spielfigur.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {Phaser.GameObjects.Rectangle} collision - Blockierfläche.
   * @param {number} groundY - Gemeinsame Bodenlinie der Figur.
   * @returns {void}
   */
  static initializeMovementData(robotCat, collision, groundY) {
    const movementData = {
      direction: -1,
      collision,
      groundY,
      movementState: ROBOT_CAT_STATES.walking,
      stateElapsed: 0,
      activeObstacleX: null,
      lastObstacleX: null,
    };
    robotCat.setDataEnabled();
    Object.entries(movementData).forEach(([key, value]) => {
      robotCat.setData(key, value);
    });
  }

  /**
   * Erstellt eine statische Hitbox innerhalb der sichtbaren Roboterkontur.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Kollisionsgruppe.
   * @param {number} groundY - Unterkante der Roboterkatze.
   * @returns {Phaser.GameObjects.Rectangle} Unsichtbare Roboter-Hitbox.
   */
  static createCollision(scene, platforms, groundY) {
    const collision = scene.add.rectangle(
      ROBOT_CAT.spawnX,
      groundY - ROBOT_CAT.collisionHeight / 2,
      ROBOT_CAT.collisionWidth,
      ROBOT_CAT.collisionHeight,
    ).setVisible(false);
    platforms.add(collision);
    return collision;
  }

  /**
   * Registriert Lauf- und Abhebeanimation jeweils genau einmal.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static registerAnimations(scene) {
    this.registerWalkAnimation(scene);
    this.registerTakeoffAnimation(scene);
  }

  /**
   * Registriert die endlose Laufanimation.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static registerWalkAnimation(scene) {
    const texture = ROBOT_CAT_WALK_TEXTURE;
    if (scene.anims.exists(texture.animationKey)) return;
    scene.anims.create({
      key: texture.animationKey,
      frames: scene.anims.generateFrameNumbers(texture.key, {
        start: 0,
        end: texture.frameCount - 1,
      }),
      frameRate: ROBOT_CAT.walkFrameRate,
      repeat: -1,
      yoyo: true,
    });
  }

  /**
   * Registriert die einmalige Abhebeanimation in festgelegter Reihenfolge.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static registerTakeoffAnimation(scene) {
    const texture = ROBOT_CAT_FLIGHT_TEXTURE;
    if (scene.anims.exists(texture.takeoffAnimationKey)) return;
    scene.anims.create({
      key: texture.takeoffAnimationKey,
      frames: texture.takeoffSequence.map((frame) => ({
        key: texture.key,
        frame,
      })),
      frameRate: ROBOT_CAT.flightFrameRate,
      repeat: 0,
    });
  }

  /**
   * Leitet die Aktualisierung an den aktiven Bewegungszustand weiter.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  static update(robotCat, delta) {
    if (!robotCat?.active) return;
    const state = robotCat.getData("movementState");
    if (state === ROBOT_CAT_STATES.takingOff) return this.updateTakeoff(robotCat, delta);
    if (state === ROBOT_CAT_STATES.flying) return this.updateFlight(robotCat, delta);
    if (state === ROBOT_CAT_STATES.landing) return this.updateLanding(robotCat, delta);
    this.updateWalking(robotCat, delta);
  }

  /**
   * Bewegt die Roboterkatze am Boden und startet vor Boxen den Überflug.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  static updateWalking(robotCat, delta) {
    const movement = this.getGroundMovement(robotCat, delta);
    this.applyGroundMovement(robotCat, movement);
    this.resetPassedObstacle(robotCat);
    const obstacleX = this.findObstacleAhead(robotCat, movement.direction);
    if (obstacleX !== null) return this.beginTakeoff(robotCat, obstacleX);
    this.syncCollision(robotCat);
  }

  /**
   * Berechnet Position und Richtung des nächsten Bodenschritts.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {{x: number, direction: number}} Begrenzte Bodenbewegung.
   */
  static getGroundMovement(robotCat, delta) {
    let direction = robotCat.getData("direction") ?? -1;
    let x = robotCat.x + direction * ROBOT_CAT.patrolSpeed * delta / 1_000;
    if (x <= ROBOT_CAT.patrolMinX || x >= ROBOT_CAT.patrolMaxX) {
      direction *= -1;
      x = this.clampPatrolX(x);
    }
    return { x, direction };
  }

  static clampPatrolX(x) {
    return Math.min(ROBOT_CAT.patrolMaxX, Math.max(ROBOT_CAT.patrolMinX, x));
  }

  static applyGroundMovement(robotCat, movement) {
    robotCat.setData("direction", movement.direction);
    robotCat.setX(movement.x).setFlipX(movement.direction > 0);
  }

  /**
   * Findet eine noch nicht überflogene Box unmittelbar vor der Figur.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} direction - Aktuelle Bewegungsrichtung (-1 oder 1).
   * @returns {number|null} X-Position der Box oder null.
   */
  static findObstacleAhead(robotCat, direction) {
    const lastObstacleX = robotCat.getData("lastObstacleX");
    return ROBOT_CAT.flightObstaclesX.find((obstacleX) => {
      if (obstacleX === lastObstacleX) return false;
      const distance = (obstacleX - robotCat.x) * direction;
      return distance >= 0 && distance <= ROBOT_CAT.obstacleTriggerDistance;
    }) ?? null;
  }

  /**
   * Startet die Abhebephase und deaktiviert die bodennahe Blockierfläche.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} obstacleX - X-Position des zu überfliegenden Hindernisses.
   * @returns {void}
   */
  static beginTakeoff(robotCat, obstacleX) {
    this.setMovementState(robotCat, ROBOT_CAT_STATES.takingOff);
    robotCat.setData("activeObstacleX", obstacleX);
    robotCat.setData("lastObstacleX", obstacleX);
    robotCat.play(ROBOT_CAT_FLIGHT_TEXTURE.takeoffAnimationKey, true)
      .setDisplaySize(ROBOT_CAT.flightDisplaySize, ROBOT_CAT.flightDisplaySize);
    this.setCollisionEnabled(robotCat, false);
  }

  /**
   * Hebt die Roboterkatze während ihrer Startanimation weich an.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  static updateTakeoff(robotCat, delta) {
    const elapsed = this.advanceStateTime(robotCat, delta);
    const progress = this.getTakeoffProgress(elapsed);
    this.setFlightHeight(robotCat, progress);
    if (elapsed < ROBOT_CAT.takeoffDuration) return;
    this.setMovementState(robotCat, ROBOT_CAT_STATES.flying);
    robotCat.setTexture(ROBOT_CAT_FLIGHT_TEXTURE.key, 2);
  }

  /**
   * Berechnet die weich beschleunigte Höhe nach der Bodenhaftungsphase.
   * @param {number} elapsed - Vergangene Zeit der Abhebephase.
   * @returns {number} Fortschritt zwischen 0 und 1.
   */
  static getTakeoffProgress(elapsed) {
    const contactDuration = ROBOT_CAT.takeoffDuration /
      ROBOT_CAT_FLIGHT_TEXTURE.frameCount;
    const airborneElapsed = Math.max(0, elapsed - contactDuration);
    const airborneDuration = ROBOT_CAT.takeoffDuration - contactDuration;
    return this.smoothStep(airborneElapsed / airborneDuration);
  }

  /**
   * Bewegt die fliegende Roboterkatze bis hinter die aktive Box.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  static updateFlight(robotCat, delta) {
    const direction = robotCat.getData("direction") ?? -1;
    const obstacleX = robotCat.getData("activeObstacleX");
    robotCat.x += direction * ROBOT_CAT.flightSpeed * delta / 1_000;
    const distance = (robotCat.x - obstacleX) * direction;
    if (distance >= ROBOT_CAT.obstacleClearDistance) this.beginLanding(robotCat);
  }

  /**
   * Startet die manuell getaktete Landephase.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @returns {void}
   */
  static beginLanding(robotCat) {
    const texture = ROBOT_CAT_FLIGHT_TEXTURE;
    this.setMovementState(robotCat, ROBOT_CAT_STATES.landing);
    robotCat.setTexture(texture.key, texture.landingSequence[0]);
  }

  /**
   * Senkt die Roboterkatze ab und schließt die Landung am Boden ab.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  static updateLanding(robotCat, delta) {
    const elapsed = this.advanceStateTime(robotCat, delta);
    this.updateLandingFrame(robotCat, elapsed);
    this.setFlightHeight(robotCat, 1 - this.getLandingProgress(elapsed));
    if (elapsed >= this.getLandingDuration()) this.finishLanding(robotCat);
  }

  /**
   * Berechnet die weiche Abwärtsbewegung bis zum ersten Bodenkontakt.
   * @param {number} elapsed - Vergangene Zeit der Landephase.
   * @returns {number} Fortschritt zwischen 0 und 1.
   */
  static getLandingProgress(elapsed) {
    const durations = ROBOT_CAT_FLIGHT_TEXTURE.landingFrameDurations;
    const airborneDuration = durations.slice(0, -1)
      .reduce((total, duration) => total + duration, 0);
    return this.smoothStep(elapsed / airborneDuration);
  }

  static getLandingDuration() {
    return ROBOT_CAT_FLIGHT_TEXTURE.landingFrameDurations
      .reduce((total, duration) => total + duration, 0);
  }

  /**
   * Wählt den Lande-Frame anhand seiner individuellen Haltedauer.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} elapsed - Vergangene Zeit der Landephase.
   * @returns {void}
   */
  static updateLandingFrame(robotCat, elapsed) {
    const texture = ROBOT_CAT_FLIGHT_TEXTURE;
    let frameEnd = 0;
    for (let index = 0; index < texture.landingSequence.length; index += 1) {
      frameEnd += texture.landingFrameDurations[index];
      if (elapsed >= frameEnd) continue;
      robotCat.setFrame(texture.landingSequence[index]);
      return;
    }
    robotCat.setFrame(texture.landingSequence.at(-1));
  }

  /**
   * Wechselt nach der Landung zurück in den Bodenzustand.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @returns {void}
   */
  static finishLanding(robotCat) {
    robotCat.setY(robotCat.getData("groundY"))
      .play(ROBOT_CAT_WALK_TEXTURE.animationKey, true)
      .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight);
    this.setMovementState(robotCat, ROBOT_CAT_STATES.walking);
    robotCat.setData("activeObstacleX", null);
    this.setCollisionEnabled(robotCat, true);
    this.syncCollision(robotCat);
  }

  static setMovementState(robotCat, state) {
    robotCat.setData("movementState", state);
    robotCat.setData("stateElapsed", 0);
  }

  static setFlightHeight(robotCat, progress) {
    const groundY = robotCat.getData("groundY");
    robotCat.setY(groundY - ROBOT_CAT.flightHeight * progress);
  }

  static smoothStep(value) {
    const progress = Math.min(1, Math.max(0, value));
    return progress * progress * (3 - 2 * progress);
  }

  /**
   * Erhöht den Zeitzähler des aktuellen Bewegungszustands.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {number} Aktualisierte Zustandszeit.
   */
  static advanceStateTime(robotCat, delta) {
    const elapsed = (robotCat.getData("stateElapsed") ?? 0) + delta;
    robotCat.setData("stateElapsed", elapsed);
    return elapsed;
  }

  /**
   * Gibt eine Box nach ausreichendem Abstand für den Rückweg wieder frei.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @returns {void}
   */
  static resetPassedObstacle(robotCat) {
    const obstacleX = robotCat.getData("lastObstacleX");
    if (obstacleX === null) return;
    const distance = Math.abs(robotCat.x - obstacleX);
    if (distance > ROBOT_CAT.obstacleResetDistance) {
      robotCat.setData("lastObstacleX", null);
    }
  }

  static setCollisionEnabled(robotCat, isEnabled) {
    const collision = robotCat.getData("collision");
    if (collision?.body) collision.body.enable = isEnabled;
  }

  static syncCollision(robotCat) {
    const collision = robotCat.getData("collision");
    collision?.setX(robotCat.x);
    collision?.body?.updateFromGameObject();
  }
}
