SOJ = SOJ || {};
SOJ.MM = SOJ.MM || {};
SOJ.MM.EH = LanguageManager.getTextData("soj_minigame_mailman","EligibleHouses")
SOJ.MM.PickedHouses = []

Game_Interpreter.prototype.pickHouse = function() {
    num = Math.randomInt(13) + 1
    while (SOJ.MM.PickedHouses.contains(num)) {
        num = Math.randomInt(13) + 1
    }
    SOJ.MM.PickedHouses.push(num)
    this.pickRecipient(SOJ.MM.EH[`${num}`])
}

Game_Interpreter.prototype.pickRecipient = function(HouseData) {
    num = Math.randomInt(HouseData.length) + 1
    RecipientData = HouseData[`${num}`]
    $gameVariables.setValue(1965,RecipientData.recipient)
    $gameVariables.setValue(1966,RecipientData.sender)
    $gameVariables.setValue(1967,RecipientData.what)
}