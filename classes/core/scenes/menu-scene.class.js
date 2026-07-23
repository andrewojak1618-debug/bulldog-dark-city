import Phaser from 'phaser';
import { SCENES } from '../../../js/config/game-config.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.menu);
  }
}
