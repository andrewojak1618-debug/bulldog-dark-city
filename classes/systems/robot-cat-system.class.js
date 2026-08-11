import {
  ROBOT_CAT,
  ROBOT_CAT_STATES,
  ROBOT_CAT_WALK_TEXTURE,
} from "../../js/config/robot-cat-settings.js";
import { RobotCatAnimationSystem } from
  "./robot-cat-animation-system.class.js";
import { RobotCatAudioSystem } from
  "./robot-cat-audio-system.class.js";
import { RobotCatCollisionSystem } from
  "./robot-cat-collision-system.class.js";
import { RobotCatFlightSystem } from
  "./robot-cat-flight-system.class.js";

/** Lädt, erstellt und steuert die Bodenpatrouille der Roboterkatze. */
export class RobotCatSystem {
  /**
   * Lädt alle Bild- und Audioressourcen der Roboterkatze.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static load(scene) {
    RobotCatAnimationSystem.load(scene);
    RobotCatAudioSystem.load(scene);
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
    const collision = RobotCatCollisionSystem.create(scene, groundY);
    const robotCat = this.createSprite(scene, groundY);
    this.initializeMovementData(robotCat, collision, groundY);
    scene.events.once("shutdown", () =>
      RobotCatAudioSystem.stopThrustFlight(robotCat)
    );
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
      thrustFlightSound: null,
      thrustFlightFadeTween: null,
    };
    robotCat.setDataEnabled();
    Object.entries(movementData).forEach(([key, value]) => {
      robotCat.setData(key, value);
    });
  }

  /**
   * Erlaubt die seitliche Blockade nur auf der gemeinsamen Laufebene.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatze mit Hitbox.
   * @param {Phaser.Physics.Arcade.Sprite} player - Steuerbare Bulldogge.
   * @param {number} surfaceY - Technische Laufkante des Levels.
   * @returns {boolean} Ob Phaser die seitliche Kollision auflösen darf.
   */
  static canBlockGroundedPlayer(robotCat, player, surfaceY) {
    return RobotCatCollisionSystem.canBlockGroundedPlayer(
      robotCat,
      player,
      surfaceY,
    );
  }

  /**
   * Leitet die Aktualisierung an Bodenpatrouille oder Flugzustand weiter.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @param {Phaser.Physics.Arcade.Sprite|null} [player=null] - Bulldogge.
   * @returns {void}
   */
  static update(robotCat, delta, player = null) {
    if (!this.canUpdateMovement(robotCat, player)) return;
    const state = robotCat.getData("movementState");
    if (state !== ROBOT_CAT_STATES.walking) {
      RobotCatFlightSystem.update(robotCat, delta);
      return;
    }
    this.updateWalking(robotCat, delta, player);
  }

  /**
   * Prüft alle Sperrzustände vor einer Bewegungsaktualisierung.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {Phaser.Physics.Arcade.Sprite|null} player - Bulldogge.
   * @returns {boolean} Ob die Bewegung aktualisiert werden darf.
   */
  static canUpdateMovement(robotCat, player) {
    return Boolean(
      robotCat?.active &&
      !player?.isKnockedOut &&
      !robotCat.getData("isAttacking") &&
      !robotCat.getData("isHitReacting") &&
      !robotCat.getData("isDefeated"),
    );
  }

  /**
   * Bewegt die Roboterkatze am Boden und startet nötige Überflüge.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame.
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
    if (obstacle) {
      RobotCatFlightSystem.begin(robotCat, obstacle);
      return;
    }
    RobotCatCollisionSystem.sync(robotCat);
  }

  /**
   * Berechnet Position und Richtung des nächsten Bodenschritts.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {number} delta - Zeit seit dem letzten Frame.
   * @returns {{x: number, direction: number}} Nächster Bodenschritt.
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

  /**
   * Begrenzt eine Position auf den Patrouillenbereich.
   * @param {number} x - Zu begrenzende Weltposition.
   * @returns {number} Position innerhalb der Patrouillengrenzen.
   */
  static clampPatrolX(x) {
    return Math.min(ROBOT_CAT.patrolMaxX, Math.max(ROBOT_CAT.patrolMinX, x));
  }

  /**
   * Übernimmt berechnete Position, Richtung und Blickrichtung.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {{x: number, direction: number}} movement - Bodenschritt.
   * @returns {void}
   */
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
      .map((obstacle) => this.getObstacleDistance(robotCat, obstacle, direction))
      .filter(({ distance, triggerDistance }) =>
        distance >= 0 && distance <= triggerDistance
      )
      .sort((first, second) => first.distance - second.distance);
    const obstacle = candidates[0];
    return obstacle ? { id: obstacle.id, x: obstacle.x } : null;
  }

  /**
   * Ergänzt ein Hindernis um seinen gerichteten Abstand.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {{id: string, x: number, triggerDistance: number}} obstacle
   * Hindernisdefinition.
   * @param {number} direction - Aktuelle Bewegungsrichtung.
   * @returns {{id: string, x: number, triggerDistance: number,
   * distance: number}} Hindernis mit gerichtetem Abstand.
   */
  static getObstacleDistance(robotCat, obstacle, direction) {
    return {
      ...obstacle,
      distance: (obstacle.x - robotCat.x) * direction,
    };
  }

  /**
   * Verbindet statische Boxen mit der Bulldogge als dynamischem Hindernis.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {Phaser.Physics.Arcade.Sprite|null} player - Bulldogge.
   * @returns {{id: string, x: number, triggerDistance: number}[]}
   * Relevante Hindernisse.
   */
  static getFlightObstacles(robotCat, player) {
    const obstacles = ROBOT_CAT.flightObstaclesX.map((x, index) => ({
      id: `box-${index}`,
      x,
      triggerDistance: ROBOT_CAT.obstacleTriggerDistance,
    }));
    if (this.isPlayerGroundObstacle(robotCat, player)) {
      obstacles.push(this.createPlayerObstacle(player));
    }
    return obstacles;
  }

  /**
   * Erstellt den Hinderniseintrag für die Bulldogge.
   * @param {Phaser.Physics.Arcade.Sprite} player - Bulldogge.
   * @returns {{id: string, x: number, triggerDistance: number}} Hindernis.
   */
  static createPlayerObstacle(player) {
    return {
      id: ROBOT_CAT.playerObstacleId,
      x: player.x,
      triggerDistance: ROBOT_CAT.playerObstacleTriggerDistance,
    };
  }

  /**
   * Berücksichtigt die Bulldogge nur aktiv auf derselben Laufebene.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {Phaser.Physics.Arcade.Sprite|null} player - Bulldogge.
   * @returns {boolean} Ob die Bulldogge ein Bodenhindernis ist.
   */
  static isPlayerGroundObstacle(robotCat, player) {
    if (!player?.active || !player.body?.enable || player.isKnockedOut) {
      return false;
    }
    const groundY = robotCat.getData("groundY");
    return Math.abs(player.body.bottom - groundY) <=
      ROBOT_CAT.playerObstacleGroundTolerance;
  }

  /**
   * Gibt ein Hindernis nach ausreichendem Abstand wieder frei.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @returns {void}
   */
  static resetPassedObstacle(robotCat) {
    const obstacleX = robotCat.getData("lastObstacleX");
    if (obstacleX === null) return;
    if (Math.abs(robotCat.x - obstacleX) <= ROBOT_CAT.obstacleResetDistance) {
      return;
    }
    robotCat.setData("lastObstacleId", null);
    robotCat.setData("lastObstacleX", null);
  }
}
