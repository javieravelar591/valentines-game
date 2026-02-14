import Phaser from "phaser";
import DialogueBox from "../ui/DialogueBox";

type CatState = {
  sprite: Phaser.Physics.Arcade.Sprite;
  moveTimer: number;
  direction: Phaser.Math.Vector2;
  speed: number;
  name: string;
};

export default class TownScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd!: {
    up: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  dialogue!: DialogueBox;
  cats: CatState[] = [];

  catsCollected = 0;
  owner!: Phaser.Physics.Arcade.Sprite;
  ownerHasEntered: boolean = false;

  constructor() {
    super("TownScene");
  }

  private heldCat: Phaser.Physics.Arcade.Sprite | null = null;
  private heldCats: Phaser.Physics.Arcade.Sprite[] = [];
  private interactKey!: Phaser.Input.Keyboard.Key;
  private sceneLocked = false;
  private yesText!: Phaser.GameObjects.Text;
  private noText!: Phaser.GameObjects.Text;
  private choicesVisible = false;

  preload() {
    this.load.image("tiles", "src/assets/tiles/town_map.tmj");
    // this.load.tilemapTiledJSON("map", "src/assets/tiles/town_map.tmj");
    this.load.image("grass", "src/assets/sprites/tilesets/grass.png");
    this.load.spritesheet("plains", "src/assets/sprites/tilesets/plains.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("object", "src/assets/sprites/objects/objects.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("player", "src/assets/sprites/characters/player.png", {
      frameWidth: 48,
      frameHeight: 48
    });

    this.load.spritesheet("owner", "src/assets/sprites/characters/player.png", {
      frameWidth: 48,
      frameHeight: 48
    });

    this.load.spritesheet("Megacar", "src/assets/sprites/cats/black_3.png", {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet("Mr. Shredder", "src/assets/sprites/cats/grey_1.png", {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet("farmtiles", "src/assets/sprites/tilesets/farmtile.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("house", "src/assets/sprites/tilesets/house.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("roads", "src/assets/sprites/tilesets/roads.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    // this.load.image("player", "assets/sprites/player.png");
    // this.load.image("Megacar", "src/assets/sprites/cats/black_3.png");
    // this.load.image("Mr. Shredder", "src/assets/sprites/cats/grey_1.png");
    // this.load.image("gate", "assets/sprites/gate.png");
  }

  create() {
    // --- ARROW ---

    // --- TILEMAP ---
    const TILE_SIZE = 16;
    const MAP_WIDTH = 125;
    const MAP_HEIGHT = 125;

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

    this.interactKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );
    // const HOUSE_WIDTH = 10;
    // const HOUSE_HEIGHT = 12;
    // // const SHEET_WIDTH = 26;

    // const HOUSE_START_COL = 16;
    // const HOUSE_START_ROW = 2;
    // const HOUSE_MAP: number[][] = [];
    // for (let y = 0; y < HOUSE_HEIGHT; y++) {
    //   const row: number[] = [];
    //   for (let x = 0; x < HOUSE_WIDTH; x++) {
    //     const frame =
    //       (HOUSE_START_ROW + y) +
    //       (HOUSE_START_COL + x);
    //     row.push(frame);
    //   }
    //   HOUSE_MAP.push(row);
    // }

    // function stampObject(
    //   scene: Phaser.Scene,
    //   map: number[][],
    //   startX: number,
    //   startY: number,
    //   texture: string
    // ) {
    //   for (let y = 0; y < map.length; y++) {
    //     for (let x = 0; x < map[y].length; x++) {
    //       const frame = map[y][x];
    //       if (frame === -1) continue;

    //       scene.add.image(
    //         startX + x * TILE_SIZE,
    //         startY + y * TILE_SIZE,
    //         texture,
    //         frame
    //       ).setOrigin(0, 0);
    //     }
    //   }
    // }
    // stampObject(
    //   this,
    //   HOUSE_MAP,
    //   8 * TILE_SIZE,
    //   4 * TILE_SIZE,
    //   "house"
    // );
    // const ground = map.createLayer("Ground", tileset!, 0, 0);
    // const collisions = map.createLayer("Collisions", tileset!, 0, 0);

    // collisions?.setCollisionByProperty({ collides: true });

    // --- PLAYER ---
    this.player = this.physics.add.sprite(500, 450, "player", 0);
    this.player.setOrigin(0.5, 0.5);
    this.player.setCollideWorldBounds(true);
    this.anims.create({
      key: "player-idle",
      frames: this.anims.generateFrameNumbers("player", {
        start: 0,
        end: 3
      }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: "player-move",
      frames: this.anims.generateFrameNumbers("player", {
        start: 6,
        end: 9
      }),
      frameRate: 3,
      repeat: -1
    });
    this.player.play("player-idle");
    this.player.update();

    // this.physics.add.collider(this.player, collisions!);

    // --- CAMERA ---
    this.cameras.main.startFollow(this.player);
    // this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // --- INPUT ---
    const keyboard = this.input.keyboard!
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // --- DIALOGUE ---
    this.dialogue = new DialogueBox(this);

    this.dialogue.show(
      "You arrive in a quiet town...\nYou're greeted by two cats seem to have escaped!\nMaybe you can help them find their way home? 🏰"
    );
    

    //  CATS
    this.anims.create({
      key: "Megacar-idle",
      frames: this.anims.generateFrameNumbers("Megacar", {
        start: 40,
        end: 44
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: "Megacar-sit",
      frames: this.anims.generateFrameNumbers("Megacar", {
        start: 36,
        end: 40
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.anims.create({
      key: "Megacar-lay",
      frames: this.anims.generateFrameNumbers("Megacar", {
        start: 136,
        end: 139
      }),
      frameRate: 2,
      repeat: -1
    });

    this.anims.create({
      key: "Megacar-run",
      frames: this.anims.generateFrameNumbers("Megacar", {
        start: 48,
        end: 51
      }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: "Mr. Shredder-idle",
      frames: this.anims.generateFrameNumbers("Mr. Shredder", {
        start: 40,
        end: 44
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: "Mr. Shredder-sit",
      frames: this.anims.generateFrameNumbers("Mr. Shredder", {
        start: 36,
        end: 40
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.anims.create({
      key: "Mr. Shredder-lay",
      frames: this.anims.generateFrameNumbers("Mr. Shredder", {
        start: 136,
        end: 139
      }),
      frameRate: 2,
      repeat: -1
    });

    this.anims.create({
      key: "Mr. Shredder-run",
      frames: this.anims.generateFrameNumbers("Mr. Shredder", {
        start: 48,
        end: 51
      }),
      frameRate: 10,
      repeat: -1
    });
    // this.anims.create({
    //   key: "cat-walk",
    //   frames: this.anims.generateFrameNumbers("Megacar", {
    //     frames: columnFrames(0, CAT_ROWS, CAT_COLUMNS)
    //   }),
    //   frameRate: 6,
    //   repeat: -1
    // });

    this.createCat(350, 300, "Megacar");
    this.createCat(400, 280, "Mr. Shredder");
  }

    update(time: number, delta: number) {
      this.handleMovement();
      if (this.heldCat) {
        this.heldCat.x = this.player.x;
        this.heldCat.y = this.player.y - 20; // slightly above player
      }
      if (this.sceneLocked) {
        this.player.setVelocity(0,0);
        return;
      }
      this.updateCats(delta);
      this.handleCatInteraction();
      this.handCatsToOwner();
    }

    handleMovement() {
      const speed = 125;
      let vx = 0;
      let vy = 0;
      if (this.cursors.left?.isDown || this.wasd.left.isDown) {
        vx = -speed;
        this.player.setFlipX(true);
      } else if (this.cursors.right?.isDown || this.wasd.right.isDown) {
        vx = speed
        this.player.setFlipX(false);
      }

      if (this.cursors.up?.isDown || this.wasd.up.isDown) {
        vy = -speed;
      } else if (this.cursors.down?.isDown || this.wasd.down.isDown) {
        vy = speed;
      }

      this.player.setVelocity(vx, vy);
      if (vx !== 0 || vy !== 0) {
        if (this.player.anims.currentAnim?.key !== "player-move") {
          console.log("Playing move animation");
          this.player.play("player-move");
        }
      } else {
        if (this.player.anims.currentAnim?.key !== "player-idle") {
          this.player.play("player-idle");
        }
      }
    }
    
    handleCatInteraction() {
      // Only trigger once when key is pressed
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {

        // If already holding a cat → drop it
        if (this.heldCat) {
          this.heldCat.setVelocity(0, 0);
          this.heldCat = null;
          return;
        }

        // Otherwise check nearby cats
        for (const cat of this.cats) {
          const distance = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            cat.sprite.x,
            cat.sprite.y
          );

          if (distance < 40) { // pickup radius
            this.pickUpCat(cat.sprite);
            break;
          }
        }
      }
    }

    private showValentineChoices() {
      if (this.choicesVisible) return;
      this.choicesVisible = true;
      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2 + 60;

      this.yesText = this.add.text(centerX - 60, centerY, "💕 Yes", {
        fontSize: "20px",
        color: "#00ff99"
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

      this.noText = this.add.text(centerX + 60, centerY, "💔 No", {
        fontSize: "20px",
        color: "#ff6666"
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

      // YES clicked
      this.yesText.on("pointerdown", () => {
        this.handleYes();
      });

      // NO clicked
      this.noText.on("pointerdown", () => {
        this.handleNo();
      });
    }

    private handleYes() {

      this.yesText.destroy();
      this.noText.destroy();

      this.dialogue.show("Yippee Woohooo! ❤️");

      // Cute heart effect
      this.addHearts();

      // Optional fade out
      this.time.delayedCall(2000, () => {
        this.cameras.main.fadeOut(1500);
      });
    }

    private handleNo() {

      // Move the NO button away every time it's clicked 😈
      this.noText.x = Phaser.Math.Between(100, this.scale.width - 100);
      this.noText.y = Phaser.Math.Between(200, this.scale.height - 100);
    }

    private addHearts() {
      for (let i = 0; i < 10; i++) {

        const heart = this.add.text(
          this.scale.width / 2,
          this.scale.height / 2,
          "❤️",
          { fontSize: "24px" }
        ).setOrigin(0.5);

        this.tweens.add({
          targets: heart,
          y: heart.y - Phaser.Math.Between(80, 150),
          x: heart.x + Phaser.Math.Between(-50, 50),
          alpha: 0,
          duration: 2000,
          onComplete: () => heart.destroy()
        });
      }
    }
    pickUpCat(cat: Phaser.Physics.Arcade.Sprite) {
      if (this.heldCats.length < 2) {
        cat.disableBody(true, true); // hide + disable physics
        this.heldCats.push(cat);
        this.catsCollected++;

        if (this.catsCollected === 1) {
          this.dialogue.show(`Gotcha! It's name seems to be ${cat.texture.key}\nLet's try to catch the other one and return them to their owner!`);
        }

        console.log(this.heldCats);
        if (this.catsCollected === 2 && !this.ownerHasEntered) {
          this.spawnOwner();
        }
      }

      if (this.catsCollected === 2) {
        this.spawnOwner();
      }

      // Disable wandering while held
      const catState = this.cats.find(c => c.sprite === cat);
      if (catState) {
        catState.moveTimer = 999999; // freeze behavior
      }
    }

    createCat(x: number, y: number, textureKey: "Megacar" | "Mr. Shredder") {
      const sprite = this.physics.add.sprite(x, y, textureKey, 0);
      sprite.setCollideWorldBounds(true);
      sprite.play(`${textureKey}-sit`);

      const cat: CatState = {
        sprite,
        moveTimer: 0,
        direction: new Phaser.Math.Vector2(0, 0),
        speed: 275,
        name: textureKey
      };

      this.cats.push(cat);
    }

    spawnOwner() {
      if (this.ownerHasEntered) return;
      this.ownerHasEntered = true;

      // Spawn offscreen left
      this.owner = this.physics.add.sprite(150, this.scale.height / 2, "owner");

      this.owner.setVelocityX(60);
      this.owner.setCollideWorldBounds(true);

      // Stop when inside screen
      this.time.delayedCall(1500, () => {
        this.owner.setVelocity(0, 0);
        this.owner.play("owner-idle");
      });
    }

    updateCats(delta: number) {
      for (const cat of this.cats) {
        cat.moveTimer -= delta;
        const key = cat.sprite.texture.key;

        // Time to choose a new behavior
        if (cat.moveTimer <= 0) {
          const roll = Phaser.Math.Between(0, 100);

          if (roll < 40) {
            // Sit
            cat.direction.set(0, 0);
            cat.sprite.setVelocity(0, 0);
            cat.sprite.play(`${key}-sit`, true);
            cat.moveTimer = Phaser.Math.Between(250, 500);

          } else if (roll < 65) {
            // Lay down
            cat.direction.set(0, 0);
            cat.sprite.setVelocity(0, 0);
            cat.sprite.play(`${key}-lay`, true);
            cat.moveTimer = Phaser.Math.Between(500, 750);
          } else {
            // Wander
            let dx = 0;
            let dy = 0;

            // Ensure NOT (0,0)
            while (dx === 0 && dy === 0) {
              dx = Phaser.Math.Between(-1, 1);
              dy = Phaser.Math.Between(-1, 1);
            }

            cat.direction.set(dx, dy).normalize();

            cat.sprite.setVelocity(
              cat.direction.x * cat.speed,
              cat.direction.y * cat.speed
            );

            // Only flip if actually moving horizontally
            if (cat.direction.x !== 0) {
              cat.sprite.setFlipX(cat.direction.x < 0);
            }

            // Only change animation if needed
            if (cat.sprite.anims.currentAnim?.key !== `${key}-run`) {
              cat.sprite.play(`${key}-run`, true);
            }

            cat.moveTimer = Phaser.Math.Between(1500, 3000);
          }
        }
      }
    }

    handCatsToOwner() {
       if (this.owner &&
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          this.owner.x,
          this.owner.y
        ) < 40) {
          this.player.setVelocity(0, 0);


          // Small delay for emotional timing
          this.time.delayedCall(1000, () => {
          this.dialogue.show("Oh you found them!\nI don't know how I can thank you...\nWait, I have an idea!")

          // Option 1: Visually move cats to owner before removing
            this.heldCats.forEach((cat, index) => {
              cat.enableBody(false, this.owner.x + (index * 16), this.owner.y, true, true);

              this.tweens.add({
                targets: cat,
                x: this.owner.x,
                y: this.owner.y - 10,
                duration: 500,
                onComplete: () => {
                  cat.destroy();
                }
              });
            });

            this.heldCats = [];

            this.time.delayedCall(3000, () => {
                this.startValentineScene()
            })
        });
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

    startValentineScene() {
      this.cameras.main.fadeIn(500);
      this.cameras.main.zoomTo(1.2, 800);
      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2;

      // Move player slightly left of center
      this.player.setPosition(centerX - 40, centerY);

      // Move owner slightly right of center
      this.owner.setPosition(centerX + 40, centerY);

      // Make them face each other
      this.player.setFlipX(false);
      this.owner.setFlipX(true);

      // Remove cats
      this.heldCats.forEach(cat => cat.destroy());
      this.heldCats = [];

      // Small dramatic delay
      this.time.delayedCall(500, () => {
        this.dialogue.show("Will you be my Valentine? ❤️");

        this.time.delayedCall(500, () => {
          this.showValentineChoices();
        });
      });
    }


  createCatAnimations(textureKey: string) {
    if (this.anims.exists(`${textureKey}-sit`)) return;

    this.anims.create({
      key: `${textureKey}-idle`,
      frames: this.anims.generateFrameNumbers(textureKey, {
        start: 40,
        end: 44
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: `${textureKey}-sit`,
      frames: this.anims.generateFrameNumbers(textureKey, {
        start: 36,
        end: 40
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.anims.create({
      key: `${textureKey}-lay`,
      frames: this.anims.generateFrameNumbers(textureKey, {
        start: 136,
        end: 139
      }),
      frameRate: 2,
      repeat: -1
    });

    this.anims.create({
      key: `${textureKey}-run`,
      frames: this.anims.generateFrameNumbers(textureKey, {
        start: 48,
        end: 51
      }),
      frameRate: 10,
      repeat: -1
    });
  }
    openCastleGate() {
      console.log("Castle unlocked!");
      // We’ll wire the real gate logic next
    }

    onCatArrived(cat: Phaser.Physics.Arcade.Sprite) {
      return;
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
