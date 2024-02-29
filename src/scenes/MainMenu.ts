import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor() {
        super('MainMenu');
    }

    create() {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        const startingPoint = {
            x: 512, y: 460, width: 250, height: 50
        }
        let buttons = [
            { name: "Pong" },
            { name: "Arcanoid" },
        ]

        buttons.forEach((button, index) => {
            let x = startingPoint.x;
            let y = startingPoint.y + (index * (startingPoint.height + 10));
            this.add.rectangle(x, y, startingPoint.width, startingPoint.height, 0xffffff, 0.5).setOrigin(0.5)
            this.title = this.add.text(x, y, button.name, {
                fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
                stroke: '#000000', strokeThickness: 8,
                align: 'center'
            }).setOrigin(0.5);

            this.input.on('pointerdown', ({ position }: any): void => {
                if ((position.x > x - startingPoint.width && position.x < x + startingPoint.width) &&
                    (position.y > y - startingPoint.height && position.y < y + startingPoint.height)) {
                    this.scene.start(button.name);
                }
            });
        });
    }
}
