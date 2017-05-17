var game;
var Phaser;
var local;
var ground;
var gammaBetaVal;
var healthCircle;
var floor;
var blaster;
var playState = {
    create: function() {

        game.time.advancedTiming = true;


        game.physics.startSystem(Phaser.Physics.ARCADE);

        var map = game.add.tilemap('desert');
        map.addTilesetImage('Desert', 'tiles');
        //map.setCollisionBetween(1, 3);
        //map.setCollisionBetween(9, 11);
        //map.setCollisionBetween(17, 21);
        map.setCollisionBetween(25, 28);
        map.setCollisionBetween(35,37);
        map.setCollision(33);
        map.setCollisionBetween(41,45);

        ground = map.createLayer('Ground');
        
        ground = map.createLayer('Ground');
        
        game.physics.arcade.enable(ground, Phaser.Physics.ARCADE);
        ground.resizeWorld();
        
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.refresh();
        if (this.game.device.desktop){
            this.game.stage.scale.maxWidth = 1024;
            this.game.stage.scale.maxHeight = 768;
            this.game.stage.scale.pageAlignHorizontally = true;
            this.game.stage.scale.pageAlignVertically = true;
        } else {
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

            this.game.stage.scale.maxWidth = 1024;
            this.game.stage.scale.maxHeight = 768;
            this.game.stage.scale.pageAlignHorizontally = true;
            this.game.stage.scale.pageAlignVertically = true;
        }

        local = new RemotePlayer(socket.io.engine.id, game);
        //local.bullets.body.onCollide = new Phaser.Signal();
        //local.bullets.body.onCollide.add(hitSprite, this);
        blaster = game.add.audio('explosionSound');


        network.send.newPlayer();
        network.listen.update();
        network.listen.progressLeft();
        network.listen.playerDamaged();
    },
    update: function() {
        
        local.playerTurret.x = local.player.x;
        local.playerTurret.y = local.player.y;
        //local.healthBar.x = local.player.x;
        //local.healthBar.y = local.player.y - 50;
        //console.log(local.healthBar.x, local.healthBar.y, local.playerTurret.x, local.player.y);
        var sprite = local.player.body;
        

        sprite.velocity.x = 0;
        sprite.velocity.y = 0;
        sprite.angularVelocity = 0;
        local.playerTurret.body.angularVelocity = 0;
        
        if (game.input.activePointer.leftButton.isDown) {
            engine.createBullet(local);
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
            sprite.velocity.copyFrom(game.physics.arcade.velocityFromAngle(local.player.angle, 150));
            local.moving = true;
        }
        else {
            local.moving = false;
        }

        if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            sprite.velocity.copyFrom(game.physics.arcade.velocityFromAngle(local.player.angle, -150));
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            sprite.angularVelocity = -100;
            local.playerTurret.body.angularVelocity = -100;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            sprite.angularVelocity = 100;
            local.playerTurret.body.angularVelocity = 100;
        }
        
        for (var i = 0; i < users.enemies.length; i++) {
            game.physics.arcade.overlap(local.bullets, users.enemies[i].player, function(obj1, obj2){    engine.bulletOverlap(obj1, obj2, users.enemies[i]);}, null, this);
            game.physics.arcade.collide(local.player, users.enemies[i].player);   
        }

        /*gyro.frequency = 1;
        gyro.startTracking(function(o) {
            if (o.gamma != null) {
                sprite.velocity.x = (o.gamma / 20)*100;
                sprite.velocity.y = (o.beta / 20)*100;
                gammaBetaVal = "X: " + o.gamma + " Y: " + o.beta;
            }
        });*/
        
        engine.moveTurret();
        game.physics.arcade.collide(local.player, ground);
        game.camera.follow(local.player);
        network.send.update();

    },
    render: function() {
        uidText = game.debug.text(local.health, 25, 14, "#fff");
        game.debug.text(game.time.fps, 2, 14, "#00ff00");
        //game.debug.geom(floor, '#000000');
        if (gammaBetaVal) {
            game.debug.text(gammaBetaVal, 2, 30, "#fff");
        }
    }
};

var engine = {
    guidGenerator: function() {
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4());
    },
    playerById: function(id) {
        if (local.player.name == id) {
            return local;
        }
        
        for (var i = 0; i < users.enemies.length; i++) {
            if (users.enemies[i].player.name === id) {
                return users.enemies[i];
            }
        }
        return false;
    },
    onMovePlayer: function(data) {
        var movePlayer = engine.playerById(data.id);

        // Player not found
        if (!movePlayer) {
            console.log('Player not found: ', data.id);
            return;
        }

        // Update player position

        movePlayer.player.x = data.x;
        movePlayer.player.y = data.y;
        movePlayer.player.angle = data.angle;

        movePlayer.playerTurret.x = data.x;
        movePlayer.playerTurret.y = data.y;
        movePlayer.playerTurret.angle = data.turretAngle;
        
        var noMoreBullets = false;
        for (var i = 0; i < movePlayer.bullets.length; i++) {
            if (!noMoreBullets) {
                if (i < data.bullets.length ) {
                    engine.updateBulletPos(movePlayer, {x: data.bullets[i].x, y: data.bullets[i].y, angle: data.bullets[i].angle}, i);
                    noMoreBullets = false;
                } else {
                    noMoreBullets = true;
                    engine.resetBullet(movePlayer.bullets.children[i]);
                }
            } else {
                return false;
            }
        }
    },
    moveTurret: function() {
        var Angle = Phaser.Math.radToDeg(game.physics.arcade.angleToPointer(local.playerTurret));
        if (local.playerTurret.angle == Angle) {
            return 0;
        }
        var inc = 2;
        var delta = local.playerTurret.angle - Angle;
        if (delta > inc || delta < -inc) {
          if (delta < -180 || (delta > 0 && delta < 180)) {
               local.playerTurret.angle -= inc;
           } else {
              local.playerTurret.angle += inc;
            }
        } else {
            local.playerTurret.angle = Angle;
        }
    },
    createBullet: function() {
        if (game.time.now > local.bulletTime)
        {
            local.bullet = local.bullets.getFirstExists(false);
            animations.muzzleFlash(local.playerTurret);
            if (local.bullet)
            {
                local.bullet.reset(local.playerTurret.x, local.playerTurret.y);
                local.bullet.velocity = 900;
                local.bullet.angle = local.playerTurret.angle;
                local.bullet.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(local.playerTurret.angle, 700));
                local.bullet.anchor.setTo(0.5, 0.5);
                
                local.bulletTime = game.time.now + 1000;
                
                network.send.update();
            }
        }
    },
    resetBullet: function(bullet) {
        bullet.kill();
    },
    updateBulletPos: function(player, data, ind) {
        if (!player.bullets.children[ind].exists) {
            player.bullets.children[ind].reset(data.x, data.y);
            player.bullets.children[ind].angle = data.angle;
            player.bullets.children[ind].anchor.setTo(0.5, 0.5); 
            
            animations.muzzleFlash(player.playerTurret);
        } else {
            player.bullets.children[ind].x = data.x;
            player.bullets.children[ind].y = data.y;
        }
    },
    getBulletList: function() {
        var bulletList = [];
        for (var i = 0; i < local.bullets.children.length; i++) {
            if (local.bullets.children[i].exists) {
                bulletList.push({x: local.bullets.children[i].x, y: local.bullets.children[i].y, angle: local.bullets.children[i].angle});
            }
        }
        return bulletList;
    },
    bulletOverlap: function(player, bullet, entity) {
        entity.health -= 20;
        //this.healthCircle.frame++;\
        engine.resetBullet(bullet);
        network.send.playerInjured(entity);
    }
};
var animations = {
    muzzleFlash: function(player) {
        var muzzleFire = game.add.sprite(player.x, player.y, 'flame');
        muzzleFire.angle = player.angle;
        muzzleFire.anchor.setTo(-.2, 0.6);
        game.time.events.add(Phaser.Timer.SECOND * .05, function(){
            muzzleFire.kill();
        }, this);
        blaster.play();
    },
    drawBullet: function() {
        
    }
};
var users = {
  thisUser: engine.guidGenerator(),
  enemies: [],
  thisInd: null
};
var network = {
    listen: {
        update: function() {
            socket.on('move player', engine.onMovePlayer);
        },
        playerDamaged: function() {
            socket.on('player damaged', function(data) {
                var damagedPlayer = engine.playerById(data.playerId);
                
                damagedPlayer.health = data.health;
                damagedPlayer.healthCircle++;
            });
        },
        progressLeft: function() {
            socket.on('leave in progress', function(data) {
                var removePlayer = engine.playerById(data.id);
                
                // Player not found
                if (!removePlayer) {
                    console.log('Player not found: ', data.id);
                    return;
                }
                
                removePlayer.player.kill();
                removePlayer.playerTurret.kill();
                
                // Remove player from array
                users.enemies.splice(users.enemies.indexOf(removePlayer), 1);
            });
        }
    },
    send: {
        newPlayer: function() {
            socket.emit('new player', {
                x: local.player.x,
                y: local.player.y,
                angle: local.player.angle,
                turretAngle: local.playerTurret.angle,
                bullets: engine.getBulletList()
            });
            
            socket.on('new player', function(data) {
                // Avoid possible duplicate players
                var duplicate = engine.playerById(data.id);
                if (duplicate) {
                    console.log('Duplicate player!');
                    return;
                }
                
                // Add new player to the remote players array
                users.enemies.push(new RemotePlayer(data.id, game))
            });
        },
        newBullet:function() {
            socket.emit('createBullet', {
                x: local.player.x,
                y: local.player.y,
                angle: local.player.angle,
                turretAngle: local.playerTurret.angle,
                bullets: engine.getBulletList()
            });        
        },
        playerInjured: function(enemy) {
            socket.emit('player damaged', {
                playerID: enemy.player.name,
                health: enemy.health,
            });               
        },
        update: function() {
            socket.emit('move player', {
                x: local.player.x,
                y: local.player.y,
                angle: local.player.angle,
                turretAngle: local.playerTurret.angle,
                bullets: engine.getBulletList()
            });
        }
    }
};
