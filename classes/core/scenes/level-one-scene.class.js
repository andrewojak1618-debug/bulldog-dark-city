import Phaser from 'phaser';
import { SCENES } from '../../../js/config/game-config.js';

export class LevelOneScene extends Phaser.Scene {
  constructor() {
    super(SCENES.levelOne);
  }
}
