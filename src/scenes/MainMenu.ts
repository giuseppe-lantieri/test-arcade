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

        this.add.rectangle(512, 460, 250, 50, 0xffffff, 0.5).setOrigin(0.5)
        this.title = this.add.text(512, 460, 'Pong', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.on('pointerdown', ({ position }: any): void => {
            if (position.x > 512 - 250 && position.x < 512 + 250 && position.y > 460 - 50 && position.y < 450 + 50) {
                this.scene.start('Pong');
            }

        });
    }
}
