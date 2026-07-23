import Phaser from 'phaser';
import { SCENES } from '../../../js/config/game-config.js';

export class BossScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boss);
  }
}
