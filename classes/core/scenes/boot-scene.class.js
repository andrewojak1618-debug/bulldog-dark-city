import Phaser from 'phaser';
import { SCENES } from '../../../js/config/game-config.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  create() {
    this.scene.start(SCENES.menu);
  }
}
