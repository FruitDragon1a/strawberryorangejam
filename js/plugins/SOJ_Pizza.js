var SOJ = SOJ || {};

SOJ.P = SOJ.P || {};
SOJ.P.OrderDialogue = LanguageManager.getTextData("soj_minigame_pizza","OrderDialogue")
SOJ.P.OrderAnswers = LanguageManager.getTextData("soj_minigame_pizza","OrderAnswers")

SOJ.P.correctOrder = [];
SOJ.P.writtenOrder = [];

Game_Interpreter.prototype.newOrder = function(name) {
    customer = eval(SOJ.P.OrderAnswers[name])
    orderNumber = Math.randomInt(3)
    SOJ.P.correctOrder = customer[orderNumber]
    SOJ.P.writtenOrder = []
    this.pluginCommand('ShowMessage', [`soj_minigame_pizza.${SOJ.P.OrderDialogue[name][orderNumber]}`, '3']);
    //return SOJ.P.OrderDialogue[name][orderNumber];
}

Game_Interpreter.prototype.writeDown = function(thing) {
    if (!SOJ.P.writtenOrder.contains(thing)) {SOJ.P.writtenOrder.push(thing)}
}

Game_Interpreter.prototype.checkOrderAccuracy = function() {
    arr1 = SOJ.P.writtenOrder; arr2 = SOJ.P.correctOrder
    console.log(arr1)
    correctorder = true
    if (arr1.length != arr2.length) {correctorder = false}
    if (correctorder) {
        for (var i = 0; i < arr1.length; i++) {
            if (!arr1.includes(arr2[i])) {correctorder = false}
        }
    }
    $gameVariables.setValue(1977, correctorder)
}