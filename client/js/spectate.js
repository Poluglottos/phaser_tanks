var spectateState = {
    create: function() {

        var map = game.add.tilemap('forest');
        map.addTilesetImage('mountain_landscape', 'tilesForest');
        map.createLayer("Calque de Tile 1");
        ground = map.createLayer("Calque 2");
        game.physics.arcade.enable(ground, Phaser.Physics.ARCADE);
        ground.resizeWorld();

        blaster = game.add.audio('explosionSound');
        network.listen.update();
    },
    update: function() {
        
        for (var i = 0; i < users.enemies.length; i++) {
            var enemy = users.enemies[i];
        }
    
        game.camera.follow(users.enemies[i]);
        network.send.update();

    },
    render: function() {
        game.debug.text(game.time.fps, 2, 14, "#00ff00");
       
        if (gammaBetaVal) {
            game.debug.text(gammaBetaVal, 2, 30, "#fff");
        }
    }
};