import { DogCatcher } from "../entities/enemies/dog-catcher.class.js";
import {
  DOG_CATCHER,
  DOG_CATCHER_ANIMATION_KEYS,
  DOG_CATCHER_TEXTURES,
} from "../../js/config/dog-catcher-settings.js";
import { LEVEL_TWO } from "../../js/config/level-two-settings.js";
import { SCENES } from "../../js/config/game-settings.js";

/** Steuert die Gefangennahme nach einem K. o. durch die mutierte Katze. */
export class LevelTwoCaptureSystem {
  /**
   * Erstellt eine noch inaktive Gefangennahme-Sequenz.
   * @param {Phaser.Scene} scene - Zugehörige Level-2-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Levelplattformen.
   */
  constructor(scene, platforms) {
    this.scene = scene;
    this.platforms = platforms;
    this.dogCatcher = null;
    this.targetX = 0;
    this.isActive = false;
    this.hasFinished = false;
  }

  /**
   * Lässt den Hundefänger unmittelbar am rechten Bildrand erscheinen.
   * @param {Phaser.Physics.Arcade.Sprite} player - K. o. gegangene Bulldogge.
   * @param {Phaser.Physics.Arcade.Sprite} cat - Angreifende Katze.
   * @returns {void}
   */
  start(player, cat) {
    if (this.isActive) return;
    this.isActive = true;
    this.stopCat(cat);
    this.createDogCatcher(player);
  }

  /**
   * Erstellt und positioniert den Hundefänger für die Abschlusssequenz.
   * @param {Phaser.Physics.Arcade.Sprite} player - K. o. gegangene Bulldogge.
   * @returns {void}
   */
  createDogCatcher(player) {
    const settings = LEVEL_TWO.captureSequence;
    const spawnX = this.getDogCatcherSpawnX(settings);
    this.targetX = player.x + settings.stopDistanceX;
    this.dogCatcher = new DogCatcher(
      this.scene,
      spawnX,
      player.y,
      DOG_CATCHER_TEXTURES.walk.key,
    );
    this.dogCatcher.setDepth(settings.depth);
    this.dogCatcher.setFlipX(true);
    this.alignFeetWithPlayer(player);
    this.scene.physics.add.collider(this.dogCatcher, this.platforms);
  }

  /**
   * Berechnet eine sichtbare, aber innerhalb der Welt liegende Startposition.
   * @param {object} settings - Konfiguration der Gefangennahme-Sequenz.
   * @returns {number} Horizontale Startposition des Hundefängers.
   */
  getDogCatcherSpawnX(settings) {
    const halfWidth = DOG_CATCHER.displayWidth / 2;
    const cameraRight = this.scene.cameras.main.worldView.right;
    return Math.min(
      cameraRight + halfWidth - settings.visibleEdgeInsetX,
      LEVEL_TWO.world.width - halfWidth,
    );
  }

  /**
   * Bewegt den Hundefänger bis zur Bulldogge und startet dort den Abschluss.
   * @returns {void}
   */
  update() {
    if (!this.isActive || this.hasFinished || !this.dogCatcher?.body) return;

    if (this.dogCatcher.x > this.targetX) {
      this.dogCatcher.setVelocityX(-LEVEL_TWO.captureSequence.approachSpeed);
      this.dogCatcher.play(DOG_CATCHER_ANIMATION_KEYS.walk, true);
      return;
    }

    this.showFinalAttackFrame();
  }

  /**
   * Zeigt den letzten Netzangriff einmal und wechselt danach zu Game Over.
   * @returns {void}
   */
  showFinalAttackFrame() {
    this.hasFinished = true;
    this.dogCatcher.setVelocityX(0);
    this.dogCatcher.anims.stop();
    this.dogCatcher.setTexture(
      DOG_CATCHER_TEXTURES.attack.key,
      DOG_CATCHER_TEXTURES.attack.frameCount - 1,
    );
    this.scene.time.delayedCall(
      LEVEL_TWO.captureSequence.attackFrameDurationMs,
      () => this.scene.scene.start(SCENES.gameOver),
    );
  }

  /**
   * Friert die Katze ein, damit sie die Sequenz nicht erneut auslösen kann.
   * @param {Phaser.Physics.Arcade.Sprite} cat - Katze des Levels.
   * @returns {void}
   */
  stopCat(cat) {
    if (!cat?.body) return;
    cat.settleAfterKnockOut();
    cat.body.enable = false;
  }

  /**
   * Richtet die Fußkante des Hundefängers an der Bulldogge aus.
   * @param {Phaser.Physics.Arcade.Sprite} player - K. o. gegangene Bulldogge.
   * @returns {void}
   */
  alignFeetWithPlayer(player) {
    const playerFeetY = player.body?.bottom;
    const dogCatcherFeetY = this.dogCatcher.body?.bottom;
    if (!Number.isFinite(playerFeetY) || !Number.isFinite(dogCatcherFeetY)) {
      return;
    }
    this.dogCatcher.y += playerFeetY - dogCatcherFeetY;
  }
}
