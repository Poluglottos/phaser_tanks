/* ************************************************
 ** GAME PLAYER CLASS
 ************************************************ */
var Player = function(startX, startY, startAngle, startTurretAngle, startBullets) {
  var x = startX;
  var y = startY;
  var angle = startAngle;
  var turretAngle = startTurretAngle;
  var bullets = startBullets;
  var health = 100;
  var id;

  // Getters and setters
  var getX = function() {
    return x;
  };

  var getY = function() {
    return y;
  };

  var getAngle = function() {
    return angle;
  };

  var getTurretAngle = function() {
    return turretAngle;
  };
  
  var getBullets = function() {
    return bullets;
  };
  
  var getHealth = function() {
    return health;
  };
  
  var setX = function(newX) {
    x = newX;
  };

  var setY = function(newY) {
    y = newY;
  };

  var setAngle = function(newAngle) {
    angle = newAngle;
  };
  var setTurretAngle = function(newTurretAngle) {
    turretAngle = newTurretAngle;
  };
  var setBullets = function(newBullets) {
    bullets = newBullets;
  };
  var setHealth = function(newHealth) {
    health = newHealth;
  };

  // Define which variables and methods can be accessed
  return {
    getX: getX,
    getY: getY,
    getAngle: getAngle,
    getTurretAngle: getTurretAngle,
    getBullets: getBullets,
    getHealth: getHealth,
    setX: setX,
    setY: setY,
    setAngle: setAngle,
    setTurretAngle: setTurretAngle,
    setBullets: setBullets,
    setHealth: setHealth,
    id: id
  };
};

// Export the Player class so you can use it in
// other files by using require("Player")
module.exports = Player;
