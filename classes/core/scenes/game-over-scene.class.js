import Phaser from 'phaser';
import { SCENES } from '../../../js/config/game-config.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENES.gameOver);
  }
}
