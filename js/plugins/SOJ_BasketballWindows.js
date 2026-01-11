Game_Interpreter.prototype.createBasketballPointsWindow = function() {
    const scene = SceneManager._scene;
    scene._ballPointWindow = new Window_Base(4,Graphics.height-76,256,72);
    scene._ballPointWindow.openness = 0;
    scene._ballPointWindow.update = function() {
        Window_Base.prototype.update.call(this);
        this.openness += 13;
    };
    scene._ballPointWindow.setPoints = function(num) {
        this.contents.clear();
        this.contents.fontSize = 36;
        this.drawText(`POINTS: ${parseInt(num)}`, 0, -10, this.contents.width, "center");
    };
    SceneManager._scene.addChild(scene._ballPointWindow);
};

Game_Interpreter.prototype.createBasketballTimerWindow = function() {
    const scene = SceneManager._scene;
    scene._ballTimerWindow = new Window_Base(Graphics.width-260,Graphics.height-76,256,72);
    scene._ballTimerWindow.openness = 0;
    scene._ballTimerWindow.update = function() {
        Window_Base.prototype.update.call(this);
        this.openness += 13;
    };
    scene._ballTimerWindow.setTime = function(min,sec) {
        this.contents.clear();
        this.contents.fontSize = 36;
        this.drawText(`TIME: ${min.padZero(2)}:${sec.padZero(2)}`, 0, -10, this.contents.width, "center");
    };
    SceneManager._scene.addChild(scene._ballTimerWindow);
};

Game_Interpreter.prototype.setBallPoints = function(num) {
    const scene = SceneManager._scene;
    scene._ballPointWindow.setPoints(num);
};

Game_Interpreter.prototype.setBallTimer = function(min,sec) {
    const scene = SceneManager._scene;
    scene._ballTimerWindow.setTime(min,sec);
};