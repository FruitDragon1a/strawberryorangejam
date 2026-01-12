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
    scene._ballPointWindow.close = function() {
        this.update = function() {
            Window_Base.prototype.update.call(this);
            this.openness -= 13;
            if (this.openness <= 0) {scene.removeChild(this);};
        };
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
    scene._ballTimerWindow.close = function() {
        this.update = function() {
            Window_Base.prototype.update.call(this);
            this.openness -= 13;
            if (this.openness <= 0) {scene.removeChild(this);};
        };
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

Game_Interpreter.prototype.ballSetReticlePos = function() {
    const picture = $gameScreen.picture(52);
    const target = $gameScreen.picture(51);
    picture._x = Math.random()*Math.log(target.x()) > 3.5 ? 155 : 486; //Very slightly weights it to be farther away from the target
    picture._targetX = picture._x;
    picture._scaleY = 0;
    picture._targetScaleX = 100;
    picture._targetOpacity = 255;
    picture._scaleX = 100;
    picture._opacity = 255;
};

Game_Interpreter.prototype.ballOpenReticle = function() {
    const picture = $gameScreen.picture(52);
    picture._targetScaleY = 100;
    picture._duration = 10;
    //sconsole.log(picture);
    this.wait(10);
};

Game_Interpreter.prototype.ballCloseReticle = function() {
    const picture = $gameScreen.picture(52);
    picture._targetScaleY = 0;
    picture._duration = 10;
    this.wait(10);
};

Game_Interpreter.prototype.ballMoveReticle = function(dur) {
    const picture = $gameScreen.picture(52);
    picture._targetX = picture.x() < 320 ? 486 : 155;
    picture._duration = dur;
    //console.log(picture);
};

Math.withinRange = function(value,target,elipson) {
    return (value >= target-elipson && value <= target+elipson);
};

Game_Interpreter.prototype.ballConfirmReticle = function() {
    const picture = $gameScreen.picture(52);
    const target = $gameScreen.picture(51);
    picture._targetX = picture.x();
    picture._targetScaleX = 200;
    picture._targetScaleY = 200;
    picture._targetOpacity = 0;
    picture._duration = 10;
    var seName = this.ballHitTarget() ? "soj_ball_good" : "BA_miss";
    AudioManager.playSe({name: seName, volume: 120, pitch: 100, pan: 0});
    this.wait(10);
    return (seName === "soj_ball_good");
};

Game_Interpreter.prototype.ballHitTarget = function() {
    const picture = $gameScreen.picture(52);
    const target = $gameScreen.picture(51);
    return (Math.withinRange(picture.x(),target.x(),30))
};

Game_Interpreter.prototype.ballSetTargetPos = function() {
    const kel = $gameMap.event(38);
    var pos = 320;
    switch (kel._x) {
        case 6: pos = 240;break;
        case 10: pos = 400;break;
    };
    //console.log(kel,pos);
    //console.log(picture);
    const picture = $gameScreen.picture(51);
    picture._x = pos + (Math.randomInt(80)-40);
    picture._targetX = picture._x;
    picture._scaleY = 0;
    picture._scaleX = 100;
    picture._opacity = 255;
};

Game_Interpreter.prototype.ballOpenTarget = function() {
    const picture = $gameScreen.picture(51);
    picture._targetScaleY = 100;
    picture._duration = 10;
    //this.wait(10);
};

Game_Interpreter.prototype.ballCloseTarget = function() {
    const picture = $gameScreen.picture(51);
    picture._targetScaleY = 0;
    picture._duration = 10;
    //this.wait(10);
};

Game_Interpreter.prototype.ballCrowdJump = function() {
    for (let i = 25; i <= 35; i++) {
        let event = $gameMap.event(i);
        var route = { list: [], repeat: false, skippable: true, wait: false };
        route.list.push({ code: 15, parameters: [Math.randomInt(3)] });
        route.list.push({ code: 45, parameters: ["this.jump(0, 0)"] });
        route.list.push({ code: 0, parameters: [] });
        event.forceMoveRoute(route);
    };
};

Game_Interpreter.prototype.ballKelScore = function() {
    let event = $gameMap.event(38);
    var route = { list: [], repeat: false, skippable: true, wait: false };
    route.list.push({ code: 45, parameters: ["this.jump(0, 0)"] });
    route.list.push({ code: 0, parameters: [] });
    event.forceMoveRoute(route);
};

Game_Interpreter.prototype.ballKelMiss = function() {
    let event = $gameMap.event(38);
    var route = { list: [], repeat: false, skippable: true, wait: false };
    route.list.push({ code: 45, parameters: ["this.jump(0, 0)"] });
    route.list.push({ code: 0, parameters: [] });
    event.forceMoveRoute(route);
};

Game_Interpreter.prototype.ballKelMove = function() {
    let event = $gameMap.event(38);
    var points = [[6,14],[8,15],[10,14]];
    var target = points.filter(a => a[0] !== event._x)[Math.randomInt(2)];
    var route = { list: [], repeat: false, skippable: true, wait: true };
    route.list.push({ code: 45, parameters: [`MOVE TO: ${target[0]}, ${target[1]}`] });
    route.list.push({ code: 45, parameters: [`this.setDirection(8)`] });
    route.list.push({ code: 0, parameters: [] });
    this._character = event;
    event.forceMoveRoute(route);
    this.setWaitMode("route");
};

Game_Interpreter.prototype.ballAwardPoints = function(val) {
    var pointsVar = $gameVariables.value(110);
    var comboMulti = $gameVariables.value(115);
    $gameVariables.setValue(110,pointsVar+parseInt((130-(val/2))*comboMulti));
    this.setBallPoints($gameVariables.value(110));
};