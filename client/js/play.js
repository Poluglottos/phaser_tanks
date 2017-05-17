/* global socket RemotePlayer*/
var game;
var Phaser;
var local;
var ground;
var gammaBetaVal;
var blaster;
var playState = {
    create: function() {

        game.time.advancedTiming = true;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        
        var map = game.add.tilemap('forest');
        map.addTilesetImage('mountain_landscape', 'tilesForest');
        map.setCollisionBetween(0, 5);
        map.setCollisionBetween(16,21);
        map.setCollisionBetween(31, 37);
        map.setCollisionBetween(48,53);
        //(64, 69),(80, 85),(96, 101),(196, 198),(201, 205),(212, 221),(228, 239),(244, 255)
        map.createLayer("Calque de Tile 1");
        ground = map.createLayer("Calque 2");
        game.physics.arcade.enable(ground, Phaser.Physics.ARCADE);
        ground.resizeWorld();
        var startAngle = game.rnd.integerInRange(0, 360);
        local = new RemotePlayer(socket.io.engine.id, game, game.rnd.integerInRange(20, game.world.width), game.rnd.integerInRange(20, game.world.height), startAngle, startAngle, 100);
        //local.bullets.body.onCollide = new Phaser.Signal();
        //local.bullets.body.onCollide.add(hitSprite, this);
        blaster = game.add.audio('explosionSound');

        network.send.newPlayer();
        network.listen.update();
        network.listen.progressLeft();
        network.listen.playerDamaged();
    },
    update: function() {
        if (local.player.alive) {
            local.playerTurret.x = local.player.x;
            local.playerTurret.y = local.player.y; 
       
            local.healthBarBackground.x =  local.player.x  - (65/2);
            local.healthBarBackground.y =  local.player.y - 70;     
            local.healthBar.x =  local.healthBarBackground.x;
            local.healthBar.y =  local.healthBarBackground.y;
    
            var sprite = local.player.body;
            
    
            sprite.velocity.x = 0;
            sprite.velocity.y = 0;
            sprite.angularVelocity = 0;
            local.playerTurret.body.angularVelocity = 0;
        
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
    
            engine.moveTurret();
            
            if (game.input.activePointer.leftButton.isDown || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                engine.createBullet(local);
            }
        }
        for (var i = 0; i < users.enemies.length; i++) {
            var enemy = users.enemies[i];
            
            game.physics.arcade.overlap(local.bullets, enemy.player, function(obj1, obj2){    engine.bulletOverlap( obj2, obj1, enemy);}, null, this);
            game.physics.arcade.collide(local.player, enemy.player);   
            
            enemy.healthBarBackground.x = enemy.player.x - (enemy.healthBarBackground.width/2);
            enemy.healthBarBackground.y = enemy.player.y - 70;
            
            enemy.healthBar.x = enemy.healthBarBackground.x;
            enemy.healthBar.y = enemy.healthBarBackground.y;
        }
        
        game.physics.arcade.collide(local.player, ground);
        game.physics.arcade.collide(local.bullets, ground,  function(obj1, obj2){    engine.bulletOverlap( obj1, obj2);}, null, this);
        if (local.player.alive) {
            game.camera.follow(local.player);
            network.send.update();
        }

    },
    render: function() {
        game.debug.text(game.time.fps, 2, 14, "#00ff00");
       
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
                local.bullet.velocity = 1500;
                local.bullet.angle = local.playerTurret.angle;
                local.bullet.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(local.playerTurret.angle, 1500));
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
            player.bullets.children[ind].angle = data.angle;
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
    bulletOverlap: function( bullet, player, entity) {
        if (entity) {
            entity.health -= 20;     
            local.reloadBackground.tint = Math.random() * 0xffffff;
            if (entity.health <= 0) {
              network.send.playerDeath(entity);
              console.log(entity);
              engine.killPlayer({killedId: entity.player.name});

            } else {
  
            }
            entity.healthBar.width = (entity.health/100) * 65;
            network.send.playerInjured(entity);
        }
        engine.resetBullet(bullet);
    },
    killPlayer: function(data) {
        var removePlayer = engine.playerById(data.killedId);
        // Player not found
        if (!removePlayer) {
            console.log('Player not found: ', data.killedId);
            return;
        }
        
        removePlayer.player.kill();
        removePlayer.playerTurret.kill();
        removePlayer.healthBarBackground.destroy();
        removePlayer.healthBar.destroy();
        for (var i = 0; i < removePlayer.bullets.length; i++) {
            engine.resetBullet(removePlayer.bullets.children[i]);
        }
        // Remove player from array
        if (data.killedId != local.player.name) {
            users.enemies.splice(users.enemies.indexOf(removePlayer), 1);                
        } else {
            local.player.alive = false;
            animations.showRestart();
        }
    },
    restartGame: function(button) {
        local = new RemotePlayer(socket.io.engine.id, game, 220, 100, 0, 0, 100);        
        button.pendingDestroy = true;
        socket.emit('new player', {
            x: local.player.x,
            y: local.player.y,
            angle: local.player.angle,
            turretAngle: local.playerTurret.angle,
            bullets: engine.getBulletList()
        });
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
    showRestart: function() {
        var button = game.add.button(game.camera.x + (game.camera.width/2) - 75, game.camera.y + (game.camera.height/2) - 42, 'restartbutton', engine.restartGame, this);
        button.width = 150;
        button.height = 84;
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
               damagedPlayer.healthBar.width = (damagedPlayer.health/100) * 65;
            });
        },
        progressLeft: function() {
            socket.on('remove player', function(data) {
                engine.killPlayer(data);
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
                users.enemies.push(new RemotePlayer(data.id, game, data.x, data.y, data.angle, data.turretAngle, data.health));
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
        },
        playerDeath: function(enemy) {
             socket.emit('enemy died', {
                killerId: local.player.name,
                killedId: enemy.player.name,
            });
        }
    }
};
