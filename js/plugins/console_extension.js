class Rawberry {

  static isValidInteger(value) {
    return !isNaN(value) && isFinite(value);
  };

  /**
   * Parses Integer and ONLY integer, no decimal or characters allowed.
   * Returns NaN otherwise.
   * @returns Integer or NaN
   */
  static parseIntStrict(x) {
    return /^\d+$/.test(x) ? +x : NaN
  }

  static isString(value) {
    return typeof value === 'string' || value instanceof String;
  }

  static isStringSurroundedByQuotes(str) {
    return /^['"].*['"]$/.test(str);
  }

  static stripQuotes(str) {
    return str.replace(/^["'](.+(?=["']$))["']$/, '$1');
  }

  static addQuotes(name) {
    return name.indexOf(" ") > -1 ? `"${name}"` : name;
  };

  static findFromVariable(dest, value, name = "name", id = "id") {
    const parsedValue = parseInt(value);
    const numeric = Rawberry.isValidInteger(parsedValue);
    for (let i = 0; i < dest.length; ++i) {
      if (dest[i] !== null && (numeric && parsedValue === dest[i][id] || dest[i][name] === value)) {
        return dest[i];
      }
    }
    return null;
  };

  static mergeIDAndName(id, name) {
    return `${id}:${Rawberry.addQuotes(name)}`;
  };

  static getActorsSuggestions() {
    let outputNames = [];
    for (let sel of Object.values(HandlerHelper.battlerSelectors)) { // Custom selectors
      outputNames.push(Rawberry.mergeIDAndName(sel.cmd, sel.desc));
    }
    for (let data of $dataActors) {
      if (data && data.characterName.length > 0) {
        outputNames.push(Rawberry.mergeIDAndName(data.id, data.characterName));
      }
    }
    return outputNames;
  };

  static getEnemiesSuggestions() {
    let outputNames = [];
    for (let sel of Object.values(HandlerHelper.battlerSelectors)) { // Custom selectors
      outputNames.push(Rawberry.mergeIDAndName(sel.cmd, sel.desc));
    }
    let id = 0;
    for (let enemy of $gameTroop.members()) {
      const temp = enemy.name().replace('"', "'");
      outputNames.push(Rawberry.mergeIDAndName(id, temp));
      id += 1; // Enemies in troop are 0 index, despite appearance in troop
    }
    return outputNames;
  };

  static getEventsSuggestions() {
    let outputNames = [];
    for (let sel of Object.values(HandlerHelper.eventSelectors)) { // Custom selectors
      outputNames.push(Rawberry.mergeIDAndName(sel.cmd, sel.desc));
    }
    for (let event of $gameMap._events) {
      if (event) {
        const inner = event.event();
        outputNames.push(Rawberry.mergeIDAndName(event._eventId, inner.name));
      }
    }
    return outputNames;
  }

  static getPicturesSuggestions() {
    let outputNames = [];
    let id = 0;
    for (let picture of $gameScreen._pictures) {
      if (picture && picture.name().length > 0) {
        outputNames.push(Rawberry.mergeIDAndName(id, picture.name()));
      }
      id += 1; // Pictures are 0 index
    }
    return outputNames;
  }

  static findActiveActor(name) {
    return Rawberry.findFromVariable(
      $gameParty.allMembers(),
      name,
      "_characterName",
      "_actorId"
    );
  };

  static getActiveActorsByName() {
    const result = [];
    const activeMembers = $gameParty ? $gameParty.allMembers() : [];
    for (let i = 0; i < activeMembers.length; ++i) {
      result.push(
        Rawberry.mergeIDAndName(
          activeMembers[i]._actorId,
          activeMembers[i]._characterName
        )
      );
    }
    return result;
  };

  static getCharmsSuggestions() {
    let outputNames = [];
    for (let armor of $dataArmors) {
      if (armor && armor.name.length > 0) {
        const temp = armor.name.replace('"', "'");
        outputNames.push(Rawberry.addQuotes(temp));
      }
    }
    return outputNames;
  };

  static getWeaponsSuggestions() {
    let outputNames = [];
    for (let weapon of $dataWeapons) {
      if (weapon && weapon.name.length > 0) {
        const temp = weapon.name.replace('"', "'");
        outputNames.push(Rawberry.addQuotes(temp));
      }
    }
    return outputNames;
  };

  static getStatesSuggestions() {
    let outputNames = [];
    for (let state of $dataStates) {
      if (state && state.name.length > 0) {
        outputNames.push(Rawberry.mergeIDAndName(state.id, state.name));
      }
    }
    return outputNames;
  };

  static getVariablesSuggestions() {
    let outputNames = [];
    for (const variable of $dataSystem.variables) {
      if (variable && variable.length > 0) {
        outputNames.push(Rawberry.addQuotes(variable));
      }
    }
    return outputNames;
  };

  static isSingleLetter(str) {
    return /^[a-zA-Z]$/.test(str);
  }
}

class HandlerHelper {
  static parseInteger(handler, int) {
    const num = parseInt(int);
    if (handler && !Rawberry.isValidInteger(num)) {
      handler.log(`${int} is not an integer`, "red");
    };
    return num;
  };

  static parseLetter(handler, str) {
    if (handler && !Rawberry.isSingleLetter(str)) {
      handler.log(`${str} is not a valid letter`, "red");
      return null;
    };
    return str;
  };

  static parseActor(handler, id) {
    const actor = $gameActors.actor(id)
    if (handler && actor === null) {
      handler.log(`Actor ${id} not found`, "red");
      if (typeof id === "string") {
        handler.log(`Use Actor ID instead of name.`, "red");
      };
    }
    return actor;
  };

  static parseEnemy(handler, id) {
    const enemy = $gameTroop.members()[id];
    if (handler && !enemy) {
      handler.log(`Enemy ${id} not found`, "red");
    }
    return enemy;
  };

  static parseSelectorActors(handler, input) {
    let tokens = input.split(":");
    // Group selectors
    if (tokens[0] == this.battlerSelectors.EVERY.cmd) {
      return $gameActors._data.filter((x) => x);
    }
    if (tokens[0] == this.battlerSelectors.ALIVE.cmd) {
      return $gameParty.aliveMembers();
    }
    if (tokens[0] == this.battlerSelectors.DEAD.cmd) {
      return $gameParty.deadMembers();
    }
    if (tokens[0] == this.battlerSelectors.MEMBERS.cmd) {
      return $gameParty.members();
    }
    // If not, then assume singular id.
    let actor = this.parseActor(null, tokens[0])
    if (actor) {
      return [actor];
    }
    if (handler) {
      handler.log(`Invalid Actor ID/Selector ${tokens[0]}.`, "red");
    }
    return [];
  };

  static parseSelectorEnemies(handler, input) {
    let tokens = input.split(":");
    // Group selectors
    if (tokens[0] == this.battlerSelectors.EVERY.cmd) {
      return $gameTroop.members();
    }
    if (tokens[0] == this.battlerSelectors.ALIVE.cmd) {
      return $gameTroop.aliveMembers();
    }
    if (tokens[0] == this.battlerSelectors.DEAD.cmd) {
      return $gameTroop.deadMembers();
    }
    if (tokens[0] == this.battlerSelectors.MEMBERS.cmd) {
      return $gameTroop.members();
    }
    // If not, then assume singular id.
    let enemy = this.parseEnemy(null, tokens[0])
    if (enemy) {
      return [enemy];
    }
    if (handler) {
      handler.log(`Invalid Enemy ID/Selector ${tokens[0]}.`, "red");
    }
    return [];
  };

  static parseEvent(handler, id) {
    const event = $gameMap._events[id];
    if (handler && !event) {
      handler.log(`Event ${id} not found`, "red");
    }
    return event;
  };

  static parseSelectorEvents(handler, input) {
    let tokens = input.split(":");
    // Group selectors
    if (tokens[0] == this.eventSelectors.ALL.cmd) {
      return $gameMap._events.filter((x) => x);
    }
    if (tokens[0] == this.eventSelectors.ERASED.cmd) {
      return $gameMap._events.filter((x) => x && x._erased);
    }
    if (tokens[0] == this.eventSelectors.NOTERASED.cmd) {
      return $gameMap._events.filter((x) => x && !x._erased);
    }
    // If not, then assume singular id.
    let event = this.parseEvent(null, tokens[0])
    if (event) {
      return [event];
    }
    if (handler) {
      handler.log(`Invalid Event ID/Selector ${tokens[0]}.`, "red");
    }
    return [];
  };

  static parsePicture(handler, str) {
    let id = Number.parseInt(str.split(":")[0]);
    const picture = $gameScreen._pictures[id];
    if (handler && !picture) {
      handler.log(`Picture ${str} not found`, "red");
      return null;
    }
    return picture;
  };

  static parseBoolean(handler, input) {
    if (input == "on" || input == "true") {
      return true;
    }
    if (input == "off" || input == "false") {
      return false;
    }
    if (handler) {
      handler.log(`Invalid argument, please use on/off or true/false.`, "red");
    }
    return null;
  };

  static parseArmor(handler, input) {
    const item = Rawberry.findFromVariable($dataArmors, input);
    if (!item) {
      handler.log(`Charm ${input} not found.`);
    }
    return item;
  };

  static parseWeapon(handler, input) {
    const item = Rawberry.findFromVariable($dataWeapons, input);
    if (!item) {
      handler.log(`Weapon ${input} not found.`);
    }
    return item;
  };

  static parseState(handler, input) {
    const item = Rawberry.findFromVariable($dataStates, input);
    if (!item) {
      handler.log(`State ${input} not found.`);
    }
    return item;
  };

  // ================ Suggestion Lambda Functions ================ //

  static createCustomSuggestion(funcList) {
    let onSuggestionFunc = (args) => {
      let suggestionFunction = funcList[args.length - 2];
      if (suggestionFunction) {
        return suggestionFunction(); // calls that function
      }
      return [];
    }
    return onSuggestionFunc;
  };

  static createCustomSuggestionTemplate(...strList) {
    let funcList = [];
    for (let string of strList) {
      let newFunc = this.suggestions[string];
      funcList.push(newFunc);
    }
    return this.createCustomSuggestion(funcList);
  };

  static selfSwitchesToString(mapId, eventId) {
    let switchOutput = [];
    for (let letter of HandlerHelper.defaultSelfSwitches) {
      let switchValue = $gameSelfSwitches.value([mapId, eventId, letter]);
      switchOutput.push(`${letter}: ${switchValue}`);
    }
    return switchOutput.join(", ");
  }
}

HandlerHelper.defaultSelfSwitches = ["A", "B", "C", "D"];

// Added after due to not support static variable yet
HandlerHelper.suggestions = {
  BOOLEAN: () => { return ["on", "off", "true", "false"]; },
  QUANTITY: () => { return ["max"]; },
  LETTER: () => { return ["A", "B", "C", "D"]; },
  WEAPON: () => { return Rawberry.getWeaponsSuggestions() },
  ARMOR: () => { return Rawberry.getCharmsSuggestions() },
  ACTOR: () => { return Rawberry.getActorsSuggestions(); },
  ENEMY: () => { return Rawberry.getEnemiesSuggestions(); },
  STATE: () => { return Rawberry.getStatesSuggestions(); },
  EVENT: () => { return Rawberry.getEventsSuggestions(); },
  PICTURE: () => { return Rawberry.getPicturesSuggestions(); },
  VARIABLE: () => { return Rawberry.getVariablesSuggestions(); }
};

HandlerHelper.battlerSelectors = {
  EVERY: {cmd: "@e", desc: "EVERYONE"}, 
  ALIVE: {cmd: "@a", desc: "ALIVE"}, 
  DEAD: {cmd: "@d", desc: "DEAD"}, 
  MEMBERS: {cmd: "@m", desc: "MEMBERS"}, 
};

HandlerHelper.eventSelectors = {
  ALL: {cmd: "@a", desc: "ALL"}, 
  ERASED: {cmd: "@e", desc: "ERASED"}, 
  NOTERASED: {cmd: "@n", desc: "NOT-ERASED"}, 
};

addCommands = () => {
  if (typeof window.commands !== 'undefined') {
    pushAllCommands();
  } else {
    setTimeout(addCommands, 1000);
  };
}

pushAllCommands = () => {

  // New Save?

  var saveOnCommand = (handler, args) => {
    const id = args.length < 2 ? DataManager._lastAccessedId : parseInt(args[1]);
    if (isNaN(id)) {
      handler.log("Expected a number", "red");
      return;
    }
    if (id < 1 || id === 44) {
      handler.log("Invalid Save ID", "red");
      return;
    }
    if (!DataManager.saveGame(id)) {
      handler.log(`Failed to Save on id ${id}`, "red");
      return;
    }
    SoundManager.playSave();
    handler.log(`Saved on id ${id}`);
  };

  // Charms

  const charmOnCommand = (handler, args) => {
    if (args.length < 2) {
      handler.log("/charm [name] [quantity | max]");
      return;
    }
    const charm = HandlerHelper.parseArmor(handler, args[1]);
    if (!charm) { return; }
    const value = args[2] === "max" ? $gameParty.maxItems(charm) : HandlerHelper.parseInteger(handler, args[2]);
    $gameParty.gainItem(charm, value, false);
    handler.log(`Quantity of ${args[1]} is set to ${value}`);
  };

  // Weapons

  const weaponOnCommand = (handler, args) => {
    if (args.length < 2) {
      handler.log("/weapon [name] [quantity | max]");
      return;
    }
    const weapon = HandlerHelper.parseWeapon(handler, args[1]);
    if (!weapon) { return; }
    const value = args[2] === "max" ? $gameParty.maxItems(weapon) : HandlerHelper.parseInteger(handler, args[2]);
    $gameParty.gainItem(weapon, value, false);
    handler.log(`Quantity of ${args[1]} is set to ${value}`);
  };

  // Speed Down

  const speeddownOnCommand = (handler) => {
    SceneManager.determineRepeatNumber = function(deltaTime) { 
      this._smoothDeltaTime *= 0.8;
      this._smoothDeltaTime += Math.min(deltaTime, 2) * 0.2;
      if (this._smoothDeltaTime >= 0.9) {
        this._elapsedTime = 0;
        return Math.round(this._smoothDeltaTime);
      } else {
        this._elapsedTime += deltaTime;
        if (this._elapsedTime >= 1) {
          this._elapsedTime -= 1;
          return 1;
        }
        return 0;
      }	
    };
    handler.log(`Speed down!`);
  };

  // Speed Up

  const speedupOnCommand = (handler, args) => {
    let speed = 5;
    if (args.length > 1) {
      const value = HandlerHelper.parseInteger(handler, args[1]);
      if (value != null) speed = value;
    }
    SceneManager.determineRepeatNumber = function() { return speed; }
    handler.log(`Speed up to ${speed}x!`);
  };

  // Save menu

  const savemenuOnCommand = (handler) => {
    SceneManager.push(Scene_OmoriFile);
    handler.setConsole(false);
  };

  // Gold

  const goldOnCommand = (handler, args) => {
    if (args.length < 2) {
      handler.log("/gold [amount]");
      return;
    }
    const value = HandlerHelper.parseInteger(handler, args[1]);
    if (value === null) { return; }
    $gameParty.gainGold(value);
    handler.log(`Added ${value} gold! (Current Gold: ${$gameParty.gold()})`);
  };

  // Transparency

  const transOnCommand = (handler, args) => {
    if (args.length < 2) {
        handler.log("Usage: /trans [on, true | off, false]");
        return;
    }
    let value = HandlerHelper.parseBoolean(handler, args[1]);
    if (value === null) { return; }
    $gamePlayer.setTransparent(value);
    handler.log(`Player transparency ${value ? "on" : "off"}`);
  };

  const kenwayButton = (handler) => {
    $gameParty.gainGold(60);
    handler.log(`60 dollars.`);
  };

  const gameOverOnCommand = (handler) => {
    SceneManager.goto(Scene_Gameover);
    handler.setConsole(false);
  };

  // ================================ VARIABLES / SWITCHES ================================ //

  const cmdVariable = (handler, args) => {
    if (args.length < 2) {
      handler.log("/variable [name] [value]");
      return;
    }
    const variable = $dataSystem.variables.indexOf(args[1]);
    if (variable === -1) {
      handler.log(`"${args[1]}" not found.`);
      return;
    }
    if (args.length === 2) {
      let curValue = $gameVariables.value(variable);
      handler.log(`"${args[1]}" = ${curValue}`);
      if (Rawberry.isString(curValue)) {
        handler.log('WARNING: Variable is a String rather than Integer.', "yellow");
      }
      return;
    }
    
    let intParse = Rawberry.parseIntStrict(args[2]);
    if (!Number.isNaN(intParse)) {
      $gameVariables.setValue(variable, intParse);
      handler.log(`"${args[1]}" is set to ${$gameVariables.value(variable)}`);
    } else {
      $gameVariables.setValue(variable, args[2]);
      handler.log(`"${args[1]}" is set to ${$gameVariables.value(variable)}`);
      handler.log('WARNING: Variable type cannot parse into Integer. Interpreted as a String.', "yellow");
    }
  };

  // ================================ EVENT COMMANDS ================================ //

  const cmdEventInfo = (handler, args) => {
    if (args.length < 2) {
      handler.log("/eventinfo [event]");
      return;
    }

    let events = HandlerHelper.parseSelectorEvents(handler, args[1]);
    if (events.length === 1) {
      let event = events[0];
      const inner = event.event();
      handler.log(`Event: ${inner.name}`);
      handler.log(`Note: ${inner.note}`);
      handler.log(`X: ${event.x}`);
      handler.log(`Y: ${event.y}`);
      handler.log(`Erased: ${event._erased}`);
      handler.log(`Self Switches: {${HandlerHelper.selfSwitchesToString($gameMap._mapId, event._eventId)}}`);    
    } else {
      for (let event of events) {
        const inner = event.event();
        handler.log(`${event._eventId} | event: ${inner.name} | note: ${inner.note} | x: ${event.x} | y: ${event.y} | erased: ${event._erased} | self switches: {${HandlerHelper.selfSwitchesToString($gameMap._mapId, event._eventId)}}`);
      }
    }
  };

  const cmdSelfSwitch = (handler, args) => {
    if (args.length < 2) {
      handler.log("/selfswitch [event] [letter] [boolean]");
      return;
    }

    let events = HandlerHelper.parseSelectorEvents(handler, args[1]);
    let letter = HandlerHelper.parseLetter(handler, args[2]);
    let value = HandlerHelper.parseBoolean(handler, args[3]);

    for (let event of events) {
      const inner = event.event();
      $gameSelfSwitches.setValue([$gameMap._mapId, event._eventId, letter], value);
      handler.log(`Set event ${event._eventId} ${inner.name} self switch ${letter} to ${value}`);
    }
  };

  // ================================ SCREEN COMMANDS ================================ //
  const cmdErasePicture = (handler, args) => {
    if (args.length < 2) {
      handler.log("Usage: /erasepicture [id]");
      return;
    }
    const picture = HandlerHelper.parsePicture(handler, args[1])
    if (picture === null) { return; }

    handler.log(`Erased picture ${args[1]}`);
    picture.erase();  
  };

  const cmdClearScreen = (handler) => {
    $gameScreen.clear();
    handler.log(`Cleared Game Sreen`);
  };

  const cmdClearFog = (handler) => {
    $gameMap.clearMapFogs();
    handler.log(`Cleared Map Fog`);
  };


  // ================================ ACTOR AND ENEMIES COMMANDS ================================ //

  const levelOnCommand = (handler, args) => {
    if (args.length < 2) {
      handler.log("Usage: /level [actor id]");
      return;
    }
    const level = args[2] === "max" ? "max" : HandlerHelper.parseInteger(handler, args[2]);
    if (level === null) { return; }

    let actors = HandlerHelper.parseSelectorActors(handler, args[1]);
    for (let actor of actors) {
      const value = level === "max" ? actor.maxLevel() : level;
      actor.changeLevel(value, false);
      handler.log(`${actor.name()} is now level ${value}!`);        
    }
  };

  const cmdHeal = (handler, args) => {
    if (args.length < 2) {
      handler.log("Usage: /heal [actor]");
      return;
    }

    let actors = HandlerHelper.parseSelectorActors(handler, args[1]);
    for (let actor of actors) {
      actor.setHp(actor.mhp);
      actor.setMp(actor.mmp);
      handler.log(`${actor._characterName} has been healed!`);
    }
  };

  const cmdHealEnemy = (handler, args) => {
    if (args.length < 2) {
      handler.log("Usage: /healenemy [enemy]");
      return;
    }

    let enemies = HandlerHelper.parseSelectorEnemies(handler, args[1]);
    for (let enemy of enemies) {
      enemy.setHp(enemy.mhp);
      enemy.setMp(enemy.mmp);
      handler.log(`${enemy.name()} has been healed!`);
    }
  };


  const cmdSetHp = (handler, args) => {
    if (args.length < 2) {
      handler.log("Usage: /sethp [actor] [value]");
      return;
    }
    let value = args[2] === "max" ? "max" : HandlerHelper.parseInteger(handler, args[2]);
    if (value === null) { return; }

    let actors = HandlerHelper.parseSelectorActors(handler, args[1]);
    for (let actor of actors) {
      let finalValue = value === "max" ? actor.mhp : value;
      actor.setHp(finalValue);
      handler.log(`Set ${actor.name()}'s HP to ${finalValue}`);  
    }
  };

  const cmdSetMp = (handler, args) => {
    if (args.length < 2) {
      handler.log("Usage: /setmp [actor] [value]");
      return;
    }
    let value = args[2] === "max" ? "max" : HandlerHelper.parseInteger(handler, args[2]);
    if (value === null) { return; }

    let actors = HandlerHelper.parseSelectorActors(handler, args[1]);
    for (let actor of actors) {
      let finalValue = value === "max" ? actor.mmp : value;
      actor.setMp(finalValue);
      handler.log(`Set ${actor.name()}'s MP to ${finalValue}`);  
    }
  };

  const cmdSetHpEnemy = (handler, args) => {
    if (args.length < 2) {
      handler.log("Usage: /sethpenemy [enemy] [value]");
      return;
    }
    let value = args[2] === "max" ? "max" : HandlerHelper.parseInteger(handler, args[2]);
    if (value === null) { return; }

    let enemies = HandlerHelper.parseSelectorEnemies(handler, args[1]);
    for (let enemy of enemies) {
      let finalValue = value === "max" ? enemy.mhp : value;
      enemy.setHp(finalValue);
      handler.log(`Set ${enemy.name()}'s HP to ${finalValue}`);  
    }
  };

  const cmdSetMpEnemy = (handler, args) => {
    if (args.length < 2) {
      handler.log("Usage: /setmpenemy [enemy] [value]");
      return;
    }
    let value = args[2] === "max" ? "max" : HandlerHelper.parseInteger(handler, args[2]);
    if (value === null) { return; }

    let enemies = HandlerHelper.parseSelectorEnemies(handler, args[1]);
    for (let enemy of enemies) {
      let finalValue = value === "max" ? enemy.mmp : value;
      enemy.setMp(finalValue);
      handler.log(`Set ${enemy.name()}'s MP to ${finalValue}`);  
    }
  };

  const cmdAddState = (handler, args) => {
    if (args.length < 2) {
      handler.log("Usage: /addstate [actor] [id]");
      return;
    }
    let state = HandlerHelper.parseState(handler, args[2]);
    if (state === null) { return; }

    let actors = HandlerHelper.parseSelectorActors(handler, args[1]);
    for (let actor of actors) {
      actor.addState(state.id);
      handler.log(`Added state ${state.name} to ${actor.name()}`);  
    }
  };

  const cmdRemoveState = (handler, args) => {
    if (args.length < 2) {
      handler.log("Usage: /removestate [actor] [id]");
      return;
    }
    let state = HandlerHelper.parseState(handler, args[2]);
    if (state === null) { return; }

    let actors = HandlerHelper.parseSelectorActors(handler, args[1]);
    for (let actor of actors) {
      actor.removeState(state.id);
      handler.log(`Added state ${state.name} to ${actor.name()}`);  
    }
  };

  const cmdAddStateEnemy = (handler, args) => {
    if (args.length < 2) {
      handler.log("Usage: /addstateenemy [enemy] [id]");
      return;
    }
    let state = HandlerHelper.parseState(handler, args[2]);
    if (state === null) { return; }

    let enemies = HandlerHelper.parseSelectorEnemies(handler, args[1]);
    for (let enemy of enemies) {
      enemy.addState(state.id);
      handler.log(`Added state ${state.name} to ${enemy.name()}`);  
    }
  };

  const cmdRemoveStateEnemy = (handler, args) => {
    if (args.length < 2) {
      handler.log("Usage: /removestateenemy [enemy] [id]");
      return;
    }
    let state = HandlerHelper.parseState(handler, args[2]);
    if (state === null) { return; }

    let enemies = HandlerHelper.parseSelectorEnemies(handler, args[1]);
    for (let enemy of enemies) {
      enemy.removeState(state.id);
      handler.log(`Added state ${state.name} to ${enemy.name()}`);  
    }
  };

  // ================================ Adding Commands ================================ //

  window.commands.forceAdd = function(name, callback, suggestions = null) {
    this.commands[name] = callback;
    if (suggestions !== null) {
      this.suggestions[name] = suggestions;
    }
  }
  
  // window.commands = window.commands || new CommandHandler();
  window.commands.add("bettersave", saveOnCommand);
  window.commands.add("charm", charmOnCommand, HandlerHelper.createCustomSuggestionTemplate("ARMOR", "QUANTITY"));
  window.commands.add("armor", charmOnCommand, HandlerHelper.createCustomSuggestionTemplate("ARMOR", "QUANTITY"));
  window.commands.add("weapon", weaponOnCommand, HandlerHelper.createCustomSuggestionTemplate("WEAPON", "QUANTITY"));
  window.commands.add("speedup", speedupOnCommand);
  window.commands.add("speeddown", speeddownOnCommand);
  window.commands.add("savemenu", savemenuOnCommand);
  window.commands.add("gold", goldOnCommand);
  window.commands.add("trans", transOnCommand, HandlerHelper.createCustomSuggestionTemplate("BOOLEAN"));
  window.commands.add("kill", gameOverOnCommand);
  window.commands.add("level", levelOnCommand, HandlerHelper.createCustomSuggestionTemplate("ACTOR", "QUANTITY"));
  // window.commands.add("kenway", kenwayButton);

  // ================================ Override / Similar to Base Commands ================================ //
  window.commands.forceAdd("variable", cmdVariable, HandlerHelper.createCustomSuggestionTemplate("VARIABLE"));
  window.commands.forceAdd("eventinfo", cmdEventInfo, HandlerHelper.createCustomSuggestionTemplate("EVENT"));
  window.commands.forceAdd("selfswitch", cmdSelfSwitch, HandlerHelper.createCustomSuggestionTemplate("EVENT", "LETTER", "BOOLEAN"));

  window.commands.forceAdd("erasepicture", cmdErasePicture, HandlerHelper.createCustomSuggestionTemplate("PICTURE"));
  window.commands.forceAdd("clearscreen", cmdClearScreen);
  window.commands.forceAdd("clearfog", cmdClearFog);

  window.commands.forceAdd("heal", cmdHeal, HandlerHelper.createCustomSuggestionTemplate("ACTOR"));
  window.commands.forceAdd("healenemy", cmdHealEnemy, HandlerHelper.createCustomSuggestionTemplate("ENEMY"));

  window.commands.forceAdd("hp", cmdSetHp, HandlerHelper.createCustomSuggestionTemplate("ACTOR", "QUANTITY"));
  window.commands.forceAdd("mp", cmdSetMp, HandlerHelper.createCustomSuggestionTemplate("ACTOR", "QUANTITY"));
  window.commands.forceAdd("hpenemy", cmdSetHpEnemy, HandlerHelper.createCustomSuggestionTemplate("ENEMY", "QUANTITY"));
  window.commands.forceAdd("mpenemy", cmdSetMpEnemy, HandlerHelper.createCustomSuggestionTemplate("ENEMY", "QUANTITY"));

  window.commands.forceAdd("addstate", cmdAddState, HandlerHelper.createCustomSuggestionTemplate("ACTOR", "STATE"));
  window.commands.forceAdd("removestate", cmdRemoveState, HandlerHelper.createCustomSuggestionTemplate("ACTOR", "STATE"));
  window.commands.forceAdd("addstateenemy", cmdAddStateEnemy, HandlerHelper.createCustomSuggestionTemplate("ENEMY", "STATE"));
  window.commands.forceAdd("removestateenemy", cmdRemoveStateEnemy, HandlerHelper.createCustomSuggestionTemplate("ENEMY", "STATE"));
}

addCommands();