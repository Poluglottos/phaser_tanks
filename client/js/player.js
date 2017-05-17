/* global game */
var healthCircle;
var RemotePlayer = function(index, game, x, y, startAngle, startTurretAngle, health) {
  var x = x;
  var y = y;
  var angle = startAngle;
  this.moving = false;
  this.game = game;
  this.health = health;
  this.alive = true;
  //player entity
  this.player = game.add.sprite(x, y, 'tank');
  this.player.name = index;
  game.physics.arcade.enable(this.player, Phaser.Physics.ARCADE);
  this.player.body.immovable = true;
  this.player.body.collideWorldBounds = true;
  this.player.body.maxVelocity = 150;
  this.player.anchor.setTo(0.5, 0.5);
  this.player.angle = angle;
  
  //Bullets
  this.bullets = game.add.group();
  this.bullets.enableBody = true;
  this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
  this.bullets.createMultiple(60, 'bullet');
  this.bullets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', engine.resetBullet, this);
  this.bullets.setAll('checkWorldBounds', true);
  this.bulletTime = 0;

  //player turret
  this.playerTurret = game.add.sprite(x, y, 'turret');
  this.playerTurret.anchor.setTo(0.5, 0.5);
  game.physics.arcade.enable(this.playerTurret, Phaser.Physics.ARCADE);


  //Health bar
  var healthBarBackground = game.add.graphics(0, 0);
  healthBarBackground.beginFill(000);
  this.healthBarBackground = healthBarBackground.drawRect(0, 0, 65, 5);

  var healthBar = game.add.graphics(0, 0);
  healthBar.beginFill(0xff0000);
  this.healthBar = healthBar.drawRect( 0, 0, 65, 5);
  this.healthBar.width = (health/100)*65;

  this.lastPosition = {
    x: x,
    y: y,
    angle: angle
  };
};

window.RemotePlayer = RemotePlayer;
