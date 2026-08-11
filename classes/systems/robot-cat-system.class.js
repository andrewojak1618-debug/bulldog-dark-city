import {
  ROBOT_CAT,
  ROBOT_CAT_FLIGHT_TEXTURE,
  ROBOT_CAT_STATES,
  ROBOT_CAT_WALK_TEXTURE,
} from "../../js/config/robot-cat-settings.js";
import { RobotCatAnimationSystem } from
  "./robot-cat-animation-system.class.js";

/** Lädt, erstellt und steuert die Roboterkatze des dritten Levels. */
export class RobotCatSystem {
  /**
   * Lädt die vorbereiteten Lauf- und Flug-Spritesheets.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static load(scene) {
    RobotCatAnimationSystem.load(scene);
  }

  /**
   * Erstellt die patrouillierende Roboterkatze auf der Laufebene.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {number} surfaceY - Gemeinsame Laufkante des Levels.
   * @returns {Phaser.GameObjects.Sprite} Erstellte Roboterkatze.
   */
  static create(scene, surfaceY) {
    const groundY = surfaceY + ROBOT_CAT.groundOffsetY;
    RobotCatAnimationSystem.register(scene);
    const collision = this.createCollision(scene, groundY);
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
      lastObstacleId: null,
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
   * @param {number} groundY - Unterkante der Roboterkatze.
   * @returns {Phaser.GameObjects.Rectangle} Unsichtbare Roboter-Hitbox.
   */
  static createCollision(scene, groundY) {
    const collision = scene.add.rectangle(
      ROBOT_CAT.spawnX,
      groundY - ROBOT_CAT.collisionHeight / 2,
      ROBOT_CAT.collisionWidth,
      ROBOT_CAT.collisionHeight,
    ).setVisible(false);
    scene.physics.add.existing(collision, true);
    return collision;
  }

  /**
   * Erlaubt die seitliche Blockade nur auf der gemeinsamen Laufebene.
   * Dadurch kann die Bulldogge nicht auf der hohen Gegner-Hitbox landen.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatze mit Blockierfläche.
   * @param {Phaser.Physics.Arcade.Sprite} player - Steuerbare Bulldogge.
   * @param {number} surfaceY - Technische Laufkante des Levels.
   * @returns {boolean} Ob Phaser die seitliche Kollision auflösen darf.
   */
  static canBlockGroundedPlayer(robotCat, player, surfaceY) {
    const collision = robotCat?.getData("collision");
    if (!collision?.body?.enable || !player?.body) return false;
    const groundTolerance = 12;
    return player.body.bottom >= surfaceY - groundTolerance;
  }

  /**
   * Leitet die Aktualisierung an den aktiven Bewegungszustand weiter.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @param {Phaser.Physics.Arcade.Sprite|null} [player=null] - Bulldogge.
   * @returns {void}
   */
  static update(robotCat, delta, player = null) {
    if (
      !robotCat?.active ||
      robotCat.getData("isHitReacting") ||
      robotCat.getData("isDefeated")
    ) return;
    const state = robotCat.getData("movementState");
    if (state === ROBOT_CAT_STATES.takingOff) return this.updateTakeoff(robotCat, delta);
    if (state === ROBOT_CAT_STATES.flying) return this.updateFlight(robotCat, delta);
    if (state === ROBOT_CAT_STATES.landing) return this.updateLanding(robotCat, delta);
    this.updateWalking(robotCat, delta, player);
  }

  /**
   * Bewegt die Roboterkatze am Boden und startet vor Boxen den Überflug.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @param {Phaser.Physics.Arcade.Sprite|null} player - Bulldogge.
   * @returns {void}
   */
  static updateWalking(robotCat, delta, player) {
    const movement = this.getGroundMovement(robotCat, delta);
    this.applyGroundMovement(robotCat, movement);
    this.resetPassedObstacle(robotCat);
    const obstacle = this.findObstacleAhead(
      robotCat,
      movement.direction,
      player,
    );
    if (obstacle) return this.beginTakeoff(robotCat, obstacle);
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
   * Findet das nächste noch nicht überflogene Hindernis vor der Figur.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} direction - Aktuelle Bewegungsrichtung (-1 oder 1).
   * @param {Phaser.Physics.Arcade.Sprite|null} player - Bulldogge.
   * @returns {{id: string, x: number}|null} Hindernis oder null.
   */
  static findObstacleAhead(robotCat, direction, player = null) {
    const lastObstacleId = robotCat.getData("lastObstacleId");
    const candidates = this.getFlightObstacles(robotCat, player)
      .filter(({ id }) => id !== lastObstacleId)
      .map((obstacle) => ({
        ...obstacle,
        distance: (obstacle.x - robotCat.x) * direction,
      }))
      .filter(({ distance, triggerDistance }) =>
        distance >= 0 && distance <= triggerDistance
      )
      .sort((first, second) => first.distance - second.distance);
    const obstacle = candidates[0];
    return obstacle ? { id: obstacle.id, x: obstacle.x } : null;
  }

  /**
   * Verbindet statische Boxen mit der Bulldogge als dynamischem Hindernis.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {Phaser.Physics.Arcade.Sprite|null} player - Bulldogge.
   * @returns {{id: string, x: number, triggerDistance: number}[]}
   * Aktuell relevante Hindernisse.
   */
  static getFlightObstacles(robotCat, player) {
    const obstacles = ROBOT_CAT.flightObstaclesX.map((x, index) => ({
      id: `box-${index}`,
      x,
      triggerDistance: ROBOT_CAT.obstacleTriggerDistance,
    }));
    if (this.isPlayerGroundObstacle(robotCat, player)) {
      obstacles.push({
        id: ROBOT_CAT.playerObstacleId,
        x: player.x,
        triggerDistance: ROBOT_CAT.playerObstacleTriggerDistance,
      });
    }
    return obstacles;
  }

  /**
   * Berücksichtigt die Bulldogge nur aktiv und auf der gemeinsamen Laufebene.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {Phaser.Physics.Arcade.Sprite|null} player - Bulldogge.
   * @returns {boolean} Ob die Roboterkatze die Bulldogge überfliegen soll.
   */
  static isPlayerGroundObstacle(robotCat, player) {
    if (
      !player?.active ||
      !player.body?.enable ||
      player.isKnockedOut
    ) return false;
    const groundY = robotCat.getData("groundY");
    return Math.abs(player.body.bottom - groundY) <=
      ROBOT_CAT.playerObstacleGroundTolerance;
  }

  /**
   * Startet die Abhebephase und deaktiviert die bodennahe Blockierfläche.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {{id: string, x: number}} obstacle - Aktives Hindernis.
   * @returns {void}
   */
  static beginTakeoff(robotCat, obstacle) {
    this.setMovementState(robotCat, ROBOT_CAT_STATES.takingOff);
    robotCat.setData("activeObstacleX", obstacle.x);
    robotCat.setData("lastObstacleId", obstacle.id);
    robotCat.setData("lastObstacleX", obstacle.x);
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
      robotCat.setData("lastObstacleId", null);
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
