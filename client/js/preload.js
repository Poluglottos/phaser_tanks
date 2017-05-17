var bootState = {
    preload: function() {
        //Loading Tilemap
        game.load.tilemap('desert', 'assets/tilemaps/desert2.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/tilemaps/tmw_desert_spacing.png');
        
        game.load.tilemap('forest', 'assets/tilemaps/landscape.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('forest2', 'assets/tilemaps/landscapeLayer2.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tilesForest', 'assets/tilemaps/mountain_landscape.png');
        
        //Loading Sprites
        game.load.image('tank', 'assets/sprites/tank.png');
        game.load.image('turret', 'assets/sprites/turret.png');
        game.load.image('bullet', 'assets/sprites/bullet.png');
        game.load.image('gametitle', 'assets/sprites/title.png');
        game.load.image('playbutton', 'assets/sprites/play.png');
        game.load.image('restartbutton', 'assets/sprites/restart.png');        
        
        //Loading Spritesheets
        game.load.spritesheet('flame', 'assets/spritesheets/flame.png', 64, 64, 20);
        game.load.spritesheet('health', 'assets/spritesheets/download.png', 50, 50, 20);
        game.load.spritesheet('explosion', 'assets/spritesheets/explosion.jpg', 50, 50, 20);
        
        //Loading Audio
        game.load.audio('explosionSound', 'assets/sounds/explosion.mp3');
    },

    create: function() {
        //Goes to menu
        game.state.start('menu');
    }
};
