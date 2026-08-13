import Phaser from "phaser";
import { BootScene } from "../../classes/core/scenes/boot-scene.class.js";
import { MenuScene } from "../../classes/core/scenes/menu-scene.class.js";
import { LevelOneScene } from "../../classes/core/scenes/level-one-scene.class.js";
import { LevelTwoScene } from "../../classes/core/scenes/level-two-scene.class.js";
import { LevelThreeScene } from
  "../../classes/core/scenes/level-three-scene.class.js";
import { GameOverScene } from "../../classes/core/scenes/game-over-scene.class.js";
import { VictoryScene } from "../../classes/core/scenes/victory-scene.class.js";
import { GameEndscreenScene } from
  "../../classes/core/scenes/game-endscreen-scene.class.js";
import { SharpTextPlugin } from
  "../../classes/core/sharp-text-plugin.class.js";
import { GAME_DIMENSIONS } from "./game-settings.js";

export const GAME_CONFIG = {
  type: Phaser.AUTO,
  banner: false,
  parent: "game",
  width: GAME_DIMENSIONS.width,
  height: GAME_DIMENSIONS.height,
  backgroundColor: "#10131a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 4,
    gamepad: true,
  },
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 900 }, debug: false },
  },
  plugins: {
    scene: [{
      key: "sharpTextPlugin",
      plugin: SharpTextPlugin,
      mapping: "sharpText",
    }],
  },
  scene: [
    BootScene,
    MenuScene,
    LevelOneScene,
    LevelTwoScene,
    LevelThreeScene,
    GameOverScene,
    VictoryScene,
    GameEndscreenScene,
  ],
};
