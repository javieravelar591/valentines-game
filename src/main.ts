import Phaser from "phaser";
// import TitleScene from "./scenes/TitleScene";
import TownScene from "./scenes/TownScene";
// import CastleScene from "./scenes/CastleScene";

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [/*TitleScene*/TownScene/*CastleScene*/],
});