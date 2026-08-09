import Phaser from "phaser";
import { BootScene } from "../../classes/core/scenes/boot-scene.class.js";
import { MenuScene } from "../../classes/core/scenes/menu-scene.class.js";
import { LevelOneScene } from "../../classes/core/scenes/level-one-scene.class.js";
import { LevelTwoScene } from "../../classes/core/scenes/level-two-scene.class.js";
import { LevelThreeScene } from
  "../../classes/core/scenes/level-three-scene.class.js";
import { BossScene } from "../../classes/core/scenes/boss-scene.class.js";
import { GameOverScene } from "../../classes/core/scenes/game-over-scene.class.js";
import { VictoryScene } from "../../classes/core/scenes/victory-scene.class.js";
import { GAME_DIMENSIONS } from "./game-settings.js";

export const GAME_CONFIG = {
  type: Phaser.AUTO,
  parent: "game",
  width: GAME_DIMENSIONS.width,
  height: GAME_DIMENSIONS.height,
  backgroundColor: "#10131a",
  input: {
    gamepad: true,
  },
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 900 }, debug: false },
  },
  scene: [
    BootScene,
    MenuScene,
    LevelOneScene,
    LevelTwoScene,
    LevelThreeScene,
    BossScene,
    GameOverScene,
    VictoryScene,
  ],
};
