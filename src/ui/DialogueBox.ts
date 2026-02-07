// DialogueBox.ts
export default class DialogueBox {
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const bg = scene.add.rectangle(400, 540, 760, 100, 0x000000, 0.7);
    this.text = scene.add.text(50, 500, "", {
      fontSize: "18px",
      wordWrap: { width: 700 },
    });

    this.container = scene.add.container(0, 0, [bg, this.text]);
    this.container.setDepth(100);
    this.container.setVisible(false);
  }

  show(message: string, onComplete?: () => void) {
    this.container.setVisible(true);
    this.text.setText(message);

    this.scene.input.once("pointerdown", () => {
      this.container.setVisible(false);
      onComplete?.();
    });
  }
}