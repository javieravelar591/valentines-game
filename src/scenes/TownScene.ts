import Phaser from "phaser";
import DialogueBox from "../ui/DialogueBox";

export default class TownScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  dialogue!: DialogueBox;
  cats!: Phaser.Physics.Arcade.Sprite[];
  catsAtCastle = 0;

  constructor() {
    super("TownScene");
  }

  preload() {
    this.load.image("tiles", "src/assets/tiles/town_map.tmj");
    // this.load.tilemapTiledJSON("map", "src/assets/tiles/town_map.tmj");
    this.load.image("grass", "src/assets/sprites/tilesets/grass.png");
    this.load.image("player", "src/assets/sprites/characters/player.png");

    // this.load.image("player", "assets/sprites/player.png");
    this.load.image("cat1", "assets/sprites/cat1.png");
    this.load.image("cat2", "assets/sprites/cat2.png");
    // this.load.image("gate", "assets/sprites/gate.png");
  }

  create() {
    // --- TILEMAP ---
    const TILE_SIZE = 16;
    const MAP_WIDTH = 50;
    const MAP_HEIGHT = 50;

    // const map = this.make.tilemap({ key: "map" });
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        this.add.image(
          x * TILE_SIZE,
          y * TILE_SIZE,
          "grass"
        ).setOrigin(0, 0);
      }
    }

    // const ground = map.createLayer("Ground", tileset!, 0, 0);
    // const collisions = map.createLayer("Collisions", tileset!, 0, 0);

    // collisions?.setCollisionByProperty({ collides: true });

    // --- PLAYER ---
    this.player = this.physics.add.sprite(400, 300, "player");
    this.player.setCollideWorldBounds(true);

    // this.physics.add.collider(this.player, collisions!);

    // --- CAMERA ---
    this.cameras.main.startFollow(this.player);
    // this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // --- INPUT ---
    this.cursors = this.input.keyboard!.createCursorKeys();

    // --- DIALOGUE ---
    this.dialogue = new DialogueBox(this);

    this.dialogue.show(
      "You arrive in a quiet town...\nA castle watches from the hill."
    );

    this.cats = [];

    const cat1 = this.physics.add.sprite(300, 400, "cat1");
    const cat2 = this.physics.add.sprite(550, 250, "cat2");

    cat1.setData("activated", false);
    cat2.setData("activated", false);
    cat1.setScale(0.9);
    cat2.setScale(0.9);

    this.cats.push(cat1, cat2);
  }

  update() {
    this.handleMovement();
  }

  handleMovement() {
    const speed = 150;
    this.player.setVelocity(0);

    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up?.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down?.isDown) {
      this.player.setVelocityY(speed);
    }
  }

  activateCat(cat: Phaser.Physics.Arcade.Sprite) {
    if (cat.getData("activated")) return;

    cat.setData("activated", true);
    cat.body!.enable = false; // prevent retrigger

    this.dialogue.show(
      "The cat looks at you...\nThen starts walking uphill 🐱",
      () => {
        this.leadCatToCastle(cat);
      }
    );
  }

  openCastleGate() {
    console.log("Castle unlocked!");
    // We’ll wire the real gate logic next
  }

  onCatArrived(cat: Phaser.Physics.Arcade.Sprite) {
    cat.setTint(0xdddddd); // subtle “safe at home” look
    this.catsAtCastle++;

    if (this.catsAtCastle === 1) {
      this.dialogue.show("One cat made it home safely 🐱");
    }

    if (this.catsAtCastle === 2) {
      this.dialogue.show(
        "Both cats are home.\nThe castle gates begin to open..."
      );
      this.openCastleGate();
    }
  }

  leadCatToCastle(cat: Phaser.Physics.Arcade.Sprite) {
    const castleX = 720;
    const castleY = 140;

    this.tweens.add({
      targets: cat,
      x: castleX,
      y: castleY + Phaser.Math.Between(-20, 20),
      duration: 4000,
      ease: "Linear",
      onComplete: () => {
        this.onCatArrived(cat);
    },
  });
}
}