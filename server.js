var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var players = [];
var express = require('express');
var path = require('path');
var Player = require('./playerFunc');
app.use(express.static(path.resolve(__dirname, 'client')));


io.sockets.on('connection', function(socket) {

  socket.on('new player', network.onNewPlayer);

  socket.on('disconnect', network.onClientDisconnect);

  socket.on('enemy died', network.clientDied);

  socket.on('move player', network.onMovePlayer);
  
  socket.on('player damaged', network.onPlayerDamaged);
});

http.listen(process.env.PORT, function() {
  console.log('listening on *:3000');
});

var network = {
  playerById: function(id) {
    var i;
    for (i = 0; i < players.length; i++) {
      if (players[i].id === id) {
        return players[i];
      }
    }
    
    return false;
  },
  onNewPlayer: function(data) {
    var newPlayer = new Player(data.x, data.y, data.angle, data.turretAngle, data.bullets);
    newPlayer.id = this.id;
    
    this.broadcast.emit('new player', {
      id: newPlayer.id,
      x: newPlayer.getX(),
      y: newPlayer.getY(),
      angle: newPlayer.getAngle(),
      turretAngle: newPlayer.getTurretAngle(),
      bullets: newPlayer.getBullets(),
      health: newPlayer.getHealth()
    });
    
    var i, existingPlayer;
    for (i = 0; i < players.length; i++) {
      existingPlayer = players[i];
      this.emit('new player', {
        id: existingPlayer.id,
        x: existingPlayer.getX(),
        y: existingPlayer.getY(),
        angle: existingPlayer.getAngle(),
        turretAngle: existingPlayer.getTurretAngle(),
        bullets: existingPlayer.getBullets(),
        health: existingPlayer.getHealth()
      });
    }
    
    players.push(newPlayer);
  },
  onMovePlayer: function(data) {
    var movePlayer = network.playerById(this.id);
  
    if (!movePlayer) {
      return false;
    }
    
    movePlayer.setX(data.x);
    movePlayer.setY(data.y);
    movePlayer.setAngle(data.angle);
    movePlayer.setTurretAngle(data.turretAngle);
    movePlayer.setBullets(data.bullets);
    
    // Broadcast updated position to connected socket clients
    this.broadcast.emit('move player', {
      id: movePlayer.id,
      x: movePlayer.getX(),
      y: movePlayer.getY(),
      angle: movePlayer.getAngle(),
      turretAngle: movePlayer.getTurretAngle(),
      bullets: movePlayer.getBullets()
    });
  },
  onPlayerDamaged: function(data) {
    var damagedPlayer = network.playerById(data.playerID);
    if (!damagedPlayer) {
      return false;
    }
    damagedPlayer.setHealth(data.health);

    // Broadcast damaged player to connected socket clients
    this.broadcast.emit('player damaged', {
      playerId: damagedPlayer.id,
      health: damagedPlayer.getHealth()
    });
  },
  onClientDisconnect: function() {
    var removePlayer = network.playerById(this.id);
    
    if (!removePlayer) {
      console.log('Player not found: ' + this.id);
      return false;
    }
    
    players.splice(players.indexOf(removePlayer), 1);
    
    // Broadcast removed player to connected socket clients
    this.broadcast.emit('remove player', {
      killedId: this.id
    });
  },
  clientDied: function(data) {
    var killed = network.playerById(data.killedId);

    players.splice(players.indexOf(killed), 1);
    
    // Broadcast removed player to connected socket clients
    this.broadcast.emit('remove player', {
      killerId: data.killedId,
      killedId: data.killedId
    });
  }
};