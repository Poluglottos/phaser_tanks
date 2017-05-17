var menuState = {
    create: function() {
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
        game.stage.backgroundColor = "#FFFFFF";
        var title = game.add.sprite(game.width / 2, 60, "gametitle");
          title.anchor.set(0.5); 
          var playButton = game.add.button(game.width / 2, game.height / 2 + 100, "playbutton", this.hasUsername);
          playButton.scale.setTo(0.1,0.1);
          playButton.anchor.set(0.5);
        //game.state.start('play');
    },
    hasUsername: function() {
        if (document.getElementById('playerName').value.length == 0) {
        } else {
            game.state.start('play');
            document.getElementById('playerName').style.display = "none";
        }
    }
};