import Phaser from 'phaser';
import { BootScene } from '../../classes/core/scenes/boot-scene.class.js';
import { MenuScene } from '../../classes/core/scenes/menu-scene.class.js';
import { LevelOneScene } from '../../classes/core/scenes/level-one-scene.class.js';
import { BossScene } from '../../classes/core/scenes/boss-scene.class.js';
import { GameOverScene } from '../../classes/core/scenes/game-over-scene.class.js';

export const SCENES = Object.freeze({
  boot: 'BootScene',
  menu: 'MenuScene',
  levelOne: 'LevelOneScene',
  boss: 'BossScene',
  gameOver: 'GameOverScene',
});

export const GAME_CONFIG = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#10131a',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 900 }, debug: false },
  },
  scene: [BootScene, MenuScene, LevelOneScene, BossScene, GameOverScene],
};
