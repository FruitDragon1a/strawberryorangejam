/*:
 * @plugindesc [v1.0.4] Gives the Bestiary more features.
 *
 * @author Stahl, Pyro, vl
 *
 * @help
 * Allows bestiary to be controlled in more ways:
 * - Control whether to do Foes Filed achievement (overrideable function).
 * - What file to get data from (overrideable function).
 * - Multiple page support.
 * - Eval conditionals and better switch conditionals support.
 * - Locked page text.
 * - TextEx macro support. (Note: Text no longer squish to fit the width of the box)
 * - Backwards compatible with base game bestiary format.
 * 
 * Controls:
 * - By default, Holding shift will skip to next entry directly.
 * 
 * Dependencies: Put this BELOW base game Bestiary.js
 * 
 * ==== EXAMPLE FORMAT ====
 * Information:
 *   1516:
 *     name: FOREST BUNNY
 *     background: {name: 'battleback_rv_platform', x: 0, y: 0}
 *     position: {x: 160, y: 425}
 *     character: {name: 'ENEMY_BUNNIES', index: 0}
 *     listIndex: 0
 *   
 *     # Optional, Makes the page not consider if "enemy id is encountered" and assume always true
 *     # Useful for having unlock condition be different than usual.
 *     ignoreEnemyCondition: true
 *   
 *     # Optional, display when evaluates to true (also works on page)
 *     evalCondition: 1 == 1
 *  
 *     # Optional, display when switch of specified ID is on (also works on page)
 *     switchCondition: 1230
 *   
 *     # Optional, changes the locked text (also works on page) (default: ------------------------------)
 *     lockedText: LOCKED ENTRY!
 *   
 *     # This is optional, forces enemy to use that id for sprite
 *     forceTransformId: 1516
 *   
 *     # Bestiary can have own pages, each with own condition and locked text as well
 *     pages:
 *       1:
 *         text: |
 *           THIS IS PAGE 1
 *           More Lines!
 *     
 *           - YOU
 *       2:
 *         evalCondition: 1 == 0
 *         # if page does not have locked text, then when it fails conditional
 *         # it will hide the page and subsequent ones entirely.
 *         lockedText: LOCKED!!! DO THINGS!!!
 *         text: |
 *           THIS IS PAGE 2
 *           More Lines!
 *           
 *           - YOU
 *       3:
 *         switchCondition: 1500
 *         lockedText: LOCKED!!! UNLOCKS WHEN SWITCH 1500 IS ON!!!
 *         text: |
 *           THIS IS PAGE 3
 *           More Lines!
 *     
 *           - YOU
 * 
 * 
 * TERMS OF USE
 * Licensed under the WTFPL license
 *
 */

/**
 * Helper class for bestiary extended.
 * Its functions can be overrided with other plugin placed below.
 */
function BestiaryManager() {
  throw new Error('This is a static class');
}

/**
 * Whether to do "FOES FILED!" steam achievement when all enemies are logged.
 * @returns boolean
 */
BestiaryManager.doFoesFiledAchievement = function() {
  return false;
}

/**
 * The main information data
 * @returns String
 */
BestiaryManager.getInformationData = function() {
  return LanguageManager.getTextData('soj_sys_bestiary', 'Information');
}

/**
 * The top title when the entries is locked. Original says 'FOE FACTS!'
 * @returns String
 */
BestiaryManager.getEmptyEnemyName = function() {
  return LanguageManager.getTextData('soj_sys_bestiary', 'EmptyEnemyName');
}

/**
 * The ui prompt for Quick Switching
 * @returns String
 */
BestiaryManager.getQuickSwitchText = function() {
  return LanguageManager.getTextData('soj_sys_bestiary', 'QuickSwitch');
}

/**
 * The names of each pagetype
 * @returns 
 */
BestiaryManager.getPageNametext = function() {
  return LanguageManager.getTextData('soj_sys_bestiary', 'PageNames');
}

/**
 * The stat list
 * @returns String
 */
BestiaryManager.getStatList = function() {
  return LanguageManager.getTextData('soj_sys_bestiary', 'Stats')
}

/**
 * Input the lines from and the bestiary, and allow to return modification of it.
 * @returns Array of Strings
 */
BestiaryManager.modifyLines = function(lines, bestiary) {
  return lines;
}

/**
 * Gets the line height of the main information text.
 * @returns int : line height
 */
BestiaryManager.getLineHeight = function() {
  return 20;
}

/**
 * Adds a string to the start of all lines. Useful for setting macro for drawTextEx, like font size and color.
 * @returns String
 */
BestiaryManager.modifyLineEach = function(line, bestiary) {
  return "\\fs[22]" + line;
}

/**
 * Controls when to do page skipping.
 * @returns boolean
 */
BestiaryManager.skipPagesControl = function() {
  return Input.isPressed('shift');
}

/**
 * Controls when to force unlock all pages. Good for debugging or "guide books" type.
 * @returns 
 */
BestiaryManager.forceUnlock = function() {
  return this._debugForceUnlock;
}

/**
 * Debug variable that force unlock. Useful for console.
 */
BestiaryManager._debugForceUnlock = false;

BestiaryManager.evalPageCondition = function(page) {
  return (
    (page.switchCondition ? $gameSwitches.value(Number.parseInt(page.switchCondition)) : true) &&
    (page.evalCondition ? eval(page.evalCondition) : true)
  );
}

//=============================================================================
// * Extra conditional to avoid accidentally triggering achivement on enemy defeat.
//=============================================================================
Game_Party.prototype.addDefeatedEnemy = function(id) {
  // Of Defeated Enemies array does not contain ID
  if (!this._defeatedEnemies.contains(id)) {
    // Add ID to defeated enemies array
    this._defeatedEnemies.push(id);
  };
  // Extra conditional to avoid accidentally triggering achivement.
  if (BestiaryManager.doFoesFiledAchievement()) {
    let allEnemies = Object.keys(BestiaryManager.getInformationData()).map(Number);
    if(allEnemies.every(enemyId => this._defeatedEnemies.contains(enemyId))) {
      $gameSystem.unlockAchievement("FOES_FILED"); // Unlock complete bestiary achievement;
    }
  }
};

//=============================================================================
// * Changing where data is grabbed
//=============================================================================
Scene_OmoriBestiary.prototype.onListChangeUpdate = function() {
  var enemyId =  this._enemyListWindow.enemyId();  // Get Enemy ID
  var enemySprite = this._enemyWindow._enemySprite;  // Get Enemy Sprite
  // If the enemy ID is more than 0 / exists
  if (enemyId > 0) {
    this._enemyWindow.clearOpacity();
    enemySprite.removeChildren();
    var data = BestiaryManager.getInformationData()[enemyId];   // Get Data
    this._enemy.transform(data.forceTransformId || enemyId);     // If enemy ID has changed transform, MOVED AFTER DATA
    var background = data.background;    // Get Background Data
    this._enemyNameWindow.drawName(this._enemyListWindow.enemyName(data));    // Draw Name
    enemySprite.setHome(data.position.x, data.position.y)   // Set Home Position
    enemySprite.visible = true;    // Set Enemy Sprite to visible
    enemySprite.startMotion("other");  // Start Enemy Sprite Motion
    enemySprite.update();    // Update Enemy Sprite
    this._enemyWindow.setBackground(background.name, background.x, background.y)  // Set Background
  } else {
    enemySprite.setHome(-Graphics.width, -Graphics.height)    // Make Enemy Sprite invisible
    this._enemyNameWindow.drawName(BestiaryManager.getEmptyEnemyName())    // Draw Name
    this._enemyWindow.setBackground(null);    // Set Background
  };
};

Scene_OmoriBestiary.prototype.onEnemyListOk = function() {
  var enemyId =  this._enemyListWindow.enemyId();  // Get Enemy ID
  var data = BestiaryManager.getInformationData()[enemyId];  // Get Data
  this._enemyTextWindow.visible = true;  // Make Enemy Text Window Visible

  var lines = "";
  // Tracks recent locked page. Can be useful for other plugin to see if most recent page was locked
  this.recentLockedPage = false;
  // If there's custom more pages, use new one
  if (data.pages) {
    lines = this.getLinesPaged(data);
  } else {
    lines = this.getLinesOriginal(data);
  }

  lines = BestiaryManager.modifyLines(lines, this);
  //var page = data.pages[this.pageNumber]

  // Draw Lines
  this._enemyTextWindow.drawLines(lines, this.pageNumber, enemyId);
  var character = this._enemyTextWindow._enemyCharacter;  // Get Character
  let sprite = this._enemyTextWindow._characterSprite;
  // If Character Data Exists
  if (data.character) {
    let index = data.character.index != undefined ? data.character.index : 0
    character.setImage(data.character.name, index);    // Set Character Image
    let dir = data.character.direction || 2;
    character.setDirection(dir)
    let step = data.character.stepping == false ? false : true
    character.setStepAnime(step)
  } else {
    character.setImage('', 0);    // Set Character Image to nothing
  };
  // Update Sprite
  sprite.update()
  this._enemyTextWindow.updateCharacter();  // Update Character
  this._enemyTextWindow._characterSprite.update();
  this._enemyNameWindow.drawName(this._enemyListWindow.enemyName(data));
  this._enemyNameWindow.drawPageNum(this.pageNumber, this.getMaxPage())
};


//=============================================================================
// * Getting line data, refactored to own function for organization
//=============================================================================

Scene_OmoriBestiary.prototype.getLinesOriginal = function(data) {
  var lines = data.text.split(/[\r\n]/g);  // Get Lines
  var conditionalText = data.conditionalText;  // Get Conditional Text
  // If Conditional Text Exists
  if (conditionalText) {
    // Go through conditional text
    for (var i = 0; i < conditionalText.length; i++) {
      var textData = conditionalText[i];      // Get text Data
      if (textData.switchIds.every(function(id) { return $gameSwitches.value(id); })){      // Check if all switches are active
        var lineIndex = textData.line === null ? lines.length : textData.line;        // Get Line Index
        var extraLines = textData.text.split(/[\r\n]/g);        // Get Extra Lines
        lines.splice(lineIndex, 0, ...extraLines)        // Add extra lines to main lines array
      };
    };
  }
  return lines;
}

Scene_OmoriBestiary.prototype.getLinesPaged = function(data) {
  var page = data.pages[this.pageNumber];
  if (page) {
    // if no condition OR there is condition and it passes
    if (BestiaryManager.forceUnlock() || BestiaryManager.evalPageCondition(page)) {
      this.recentLockedPage = false;
      return page.text.split(/[\r\n]/g);
    } else {
      this.recentLockedPage = true;
      return page.lockedText ? page.lockedText.split(/[\r\n]/g) : ['------------------------------'];
    }
  }
  return null;
}

Scene_OmoriBestiary.prototype.getMaxPage = function() {
  var enemyId = this._enemyListWindow.enemyId();  // Get Enemy ID
  var data = BestiaryManager.getInformationData()[enemyId];  // Get Data
  if (!data.pages) {
    return 1;
  }
  var pageNum = 1;
  while (true) {
    let page = data.pages[pageNum]
    if (!page) break; // no page
    // if no locked text AND the page fails condition, then no page
    // In other word if there's locked text, then still allow to go through.
    if (!page.lockedText && !BestiaryManager.evalPageCondition(page)) break;
    pageNum++;
  }
  return pageNum - 1;
}

//=============================================================================
// * Changing where data is grabbed
//=============================================================================

Window_OmoBestiaryEnemyList.prototype.initialize = function() {
  // Get Entries for Sorted Bestiary list
  this._sortedBestiaryList = Object.entries(BestiaryManager.getInformationData());
  // Sort list
  this._sortedBestiaryList.sort(function(a, b) {
    var indexA = a[1].listIndex === undefined ? Number(a[0]) : a[1].listIndex
    var indexB = b[1].listIndex === undefined ? Number(b[0]) : b[1].listIndex
    return indexA - indexB
  });
  // Super Call
  Window_Command.prototype.initialize.call(this, 0, 0);
};

Window_OmoBestiaryEnemyList.prototype.makeCommandList = function() {
  var list = $gameParty._defeatedEnemies;  // Get List
  // Go Through List of Entries
  for (let [id, obj] of this._sortedBestiaryList) {
    var index = Number(id);    // Get Index
    // Do eval condition AND If ignore enemy condition then do as usual just say its true.
    if (BestiaryManager.forceUnlock() || (BestiaryManager.evalPageCondition(obj) && (obj.ignoreEnemyCondition ? true : list.contains(index)))) {
      this.addCommand(this.enemyName(obj), 'ok', true, index)      // Add Command
    } else {
      this.addCommand(obj.lockedText || '------------------------------', 'nothing', false, 0)      // Add Empty Command
    };
  };
};

//=============================================================================
// * Draw Information - Changes to drawTextEx to add colors and other styles
//=============================================================================
Window_OmoBestiaryEnemyText.prototype.drawLines = function(lines, page=0, enemyId = 0) {
  //console.log(page)
  this.contents.clear();  // Clear Contents
  
  for (var i = 0; i < lines.length; i++) {  // Go Through Lines 
    this.drawTextEx(BestiaryManager.modifyLineEach(lines[i], this), 0, -10 + (i * BestiaryManager.getLineHeight()));    // Draw Line
  };
  if (page == 3) {     // Make page 3 show the foe's stats     
    var stats = BestiaryManager.getStatList()
    
    this.drawText(` - ${stats[0]}: `, 0, 14, this.contents.width, 24);
    this.drawText(($dataEnemies[enemyId].meta.CCHeart || $dataEnemies[enemyId].params[0]), 120, 14, this.contents.width, 24);
    i = 1;
    this.drawText(` - ${stats[1]}: `, 0, 14 + (i * 24), this.contents.width, 24);
    this.drawText(($dataEnemies[enemyId].meta.CCJuice || $dataEnemies[enemyId].params[1]), 120, 14 + (i * 24), this.contents.width, 24);
    i++
    this.drawText(` - ${stats[2]}: `, 0, 14 + (i * 24), this.contents.width, 24);
    this.drawText(($dataEnemies[enemyId].meta.CCAttack || $dataEnemies[enemyId].params[2]), 120, 14 + (i * 24), this.contents.width, 24);
    i++
    this.drawText(` - ${stats[3]}: `, 0, 14 + (i * 24), this.contents.width, 24);
    this.drawText(($dataEnemies[enemyId].meta.CCDefense || $dataEnemies[enemyId].params[3]), 120, 14 + (i * 24), this.contents.width, 24);
    i++
    this.drawText(` - ${stats[4]}: `, 0, 14 + (i * 24), this.contents.width, 24);
    this.drawText(($dataEnemies[enemyId].meta.CCSpeed || $dataEnemies[enemyId].params[6]), 120, 14 + (i * 24), this.contents.width, 24);
    i++
    this.drawText(` - ${stats[5]}: `, 0, 14 + (i * 24), this.contents.width, 24);
    this.drawText(($dataEnemies[enemyId].meta.CCLuck || $dataEnemies[enemyId].params[7]), 120, 14 + (i * 24), this.contents.width, 24);
    i++
    this.drawText(` - ${stats[6]}: `, 0, 14 + (i * 24), this.contents.width, 24);
    this.drawText(($dataEnemies[enemyId].meta.CCHit || ($dataEnemies[enemyId].traits[0].value * 100)), 120, 14 + (i * 24), this.contents.width, 24);
    i++
    this.drawText(` - ${stats[7]}: `, 0, 14 + (i * 24), this.contents.width, 24);
    this.drawText(($dataEnemies[enemyId].meta.CCEva || ($dataEnemies[enemyId].traits[1].value * 100)), 120, 14 + (i * 24), this.contents.width, 24);
    i++
    this.drawText(`${stats[8]} - `, 0, 28 + (i * 24), this.contents.width, 24);
    i++
    this.drawText(` - ${stats[9]}: `, 0, 28 + (i * 24), this.contents.width, 24);
    this.drawText($dataEnemies[enemyId].meta.CCClams || $dataEnemies[enemyId].meta.CCStars || $dataEnemies[enemyId].meta.CCGold || $dataEnemies[enemyId].gold, 120, 28 + (i * 24), this.contents.width, 24);
    i++
    this.drawText(` - ${stats[10]}: `, 0, 28 + (i * 24), this.contents.width, 24);
    this.drawText(($dataEnemies[enemyId].meta.CCExp || $dataEnemies[enemyId].exp), 120, 28 + (i * 24), this.contents.width, 24);
    if ($dataEnemies[enemyId].meta.CCDrops) {
    i++
    this.drawText(` - ${stats[11]}: `, 0, 28 + (i * 24), this.contents.width, 24);
    this.drawText(($dataEnemies[enemyId].meta.CCDrops), 120, 28 + (i * 24), this.contents.width, 24);
    }
    
  }
};

Window_OmoBestiaryEnemyName.prototype.drawName = function(name) {
  this.contents.clear()
  this.drawTextEx(name, 15, -5);
};

Window_OmoBestiaryEnemyName.prototype.drawPageNum = function(pageNumber, pageMax) {
  if (pageMax > 1) { // Only draws if there is more than 1 page.
    this.contents.fontSize = 16;
    this.drawText(BestiaryManager.getPageNametext()[pageNumber-1], 0, 10, this.width-20,"right");
  }
};

Window_OmoBestiaryEnemyList.prototype.drawItem = function(index) {
  var rect = this.itemRectForText(index);
  var align = this.itemTextAlign();
  this.resetTextColor();
  this.changePaintOpacity(true);
  this.drawTextEx(this.commandName(index), rect.x, rect.y);
};

Window_OmoBestiaryEnemyText.prototype.drawInformation = function(information) {
  this.contents.clear();
  var lines = information.split(/[\r\n]/g);
  for (var i = 0; i < lines.length; i++) {
    this.drawTextEx(lines[i], 0, -10 + (i * 24));
  };
};

//=============================================================================
// * ADDED PAGE NUMBERS
//=============================================================================

Scene_OmoriBestiary.prototype.start = function() {
  // Super Call
  Scene_BaseEX.prototype.start.call(this);
  // Set page number
  this.pageNumber = 1;
  // Start Fade in
  this.startFadeIn(this.slowFadeSpeed(), false);
};

Scene_OmoriBestiary.prototype.update = function() {
  // Super Call
  Scene_BaseEX.prototype.update.call(this);

  // If Enemy Text Window is visible
  if (this._enemyTextWindow.visible) {
    //var skipPages = BestiaryManager.skipPagesControl(); // Go to next entry regardless of current page, like base game
    if (Input.isTriggered('cancel')) {
      this.pageNumber = 1;
      SoundManager.playCancel();
      this._enemyListWindow._onCursorChangeFunct = undefined;
      this._enemyListWindow.activate();
      this._enemyTextWindow.visible = false;
      this._enemyListWindow._onCursorChangeFunct = this.onListChangeUpdate.bind(this);
      return;
    }
    if (Input.isTriggered('up')) {
      this._enemyListWindow.selectPreviousEnemy();
      this.onListChangeUpdate();
      AudioManager.playSe({name: "SE_TV_BLIP", pan: 0, pitch: 100, volume: 90});
      this.onEnemyListOk();
    }
    if (Input.isTriggered('down')) {
      this._enemyListWindow.selectNextEnemy();
      this.onListChangeUpdate();
      AudioManager.playSe({name: "SE_TV_BLIP", pan: 0, pitch: 100, volume: 90});
      this.onEnemyListOk();
    }
    if (Input.isTriggered('left')) {
      if (this.pageNumber > 1) {
        this.pageNumber--;
        AudioManager.playSe({name: "mini_sh_heart_get", pan: 0, pitch: 80, volume: 90});
        this.onEnemyListOk();
      } else {
        AudioManager.playSe({name: "mini_sme_move", pan: 0, pitch: 80, volume: 90});
      }
    };
    if (Input.isTriggered('right')) {
      if (this.pageNumber < this.getMaxPage()) {
        this.pageNumber++;
        AudioManager.playSe({name: "mini_sh_heart_get", pan: 0, pitch: 80, volume: 90});
        this.onEnemyListOk();
      } else {
        AudioManager.playSe({name: "mini_sme_move", pan: 0, pitch: 80, volume: 90});
      }
    };
  };
};

Window_OmoBestiaryEnemyList.prototype.selectNextEnemy = function() {
  // Get Starting Index
  var index = (this.index() + 1)
  //console.log("index before squish: " + index)
  if(index >= this.maxItems()) {
    index = 0;
  }
  //console.log("index after squish: " + index)
  var selected = false;
  // Go Through Items
  for (var i = 0; i < this.maxItems(); i++) {
    // If item has a valid ID
    if (this._list[index].ext !== 0) {
      // audio
      //AudioManager.playSe({name: "SE_turn_page", pan: 0, pitch: 100, volume: 90});
      // Select it
      //console.log("this._list[i].ext", this._list[i].ext)
      this.select(index);
      selected = true;
      break;
    };
    index++
    if(index >= this.maxItems()) {
    index = 0;
    if (index == this.index()) {
      break
    }
  }
  };
  if(!!selected) {return;}
};

Window_OmoBestiaryEnemyList.prototype.selectPreviousEnemy = function() {
  // Get Starting Index
  var index = (this.index() - 1) < 0 ? this.maxItems() - 1 : this.index() - 1;
  // Go Through Items
  for (var i = index; i >= 0; i--) {
    // If item has a valid Id
    if (this._list[i].ext !== 0) {
      // audio
      //AudioManager.playSe({name: "SE_turn_page", pan: 0, pitch: 100, volume: 90});
      // Select it
      this.select(i);
      break;
    };
  };
};

//TR Add Quick Switch UI
let enemyinit = Window_OmoBestiaryEnemy.prototype.initialize
Window_OmoBestiaryEnemy.prototype.initialize = function(enemy) {
  // Call original Function
  enemyinit.call(this,enemy);
  //Add Shift UI
  this.createQuickSwitch();
};

Window_OmoBestiaryEnemy.prototype.createQuickSwitch = function() {
  //Adds a whole new fucking window bc the text gets drawn below the background here
  this._quickSwitch = new Window_OmoBestiaryQuickSwitch();
  var qS = this._quickSwitch
  qS.width = this.width
  qS.height = this.height
  qS.backOpacity = 0
  this.addChild(qS);
  qS.contents.clear()
 //console.log(`${Graphics.width + 8} ${Graphics.height - 34}`)
  //qS.drawTextEx(BestiaryManager.getQuickSwitchText(), 8, Graphics.height - 48);
}

//=============================================================================
// ** Window_OmoBestiaryQuickSwitch
//-----------------------------------------------------------------------------
// This window is used to show the Quick Switch UI
//=============================================================================
function Window_OmoBestiaryQuickSwitch() { this.initialize.apply(this, arguments); }
Window_OmoBestiaryQuickSwitch.prototype = Object.create(Window_Base.prototype);
Window_OmoBestiaryQuickSwitch.prototype.constructor = Window_OmoBestiaryQuickSwitch;
//=============================================================================
// * Object Initialization
//=============================================================================
Window_OmoBestiaryQuickSwitch.prototype.initialize = function() {
  // Super Call
  Window_Base.prototype.initialize.call(this, 0, 0, Graphics.width / 2, Graphics.height);
};
//=============================================================================
// * Standard Padding
//=============================================================================
Window_OmoBestiaryQuickSwitch.prototype.standardPadding = function() { return 4; }
//=============================================================================
// * Update
//=============================================================================
Window_OmoBestiaryQuickSwitch.prototype.update = function() {
  Window_Base.prototype.update.call(this)
  //clear contents
  this.contents.clear()
  if (SceneManager._scene._enemyTextWindow.visible) {
      this.drawTextEx(`${BestiaryManager.getQuickSwitchText()}`, 8, Graphics.height - 80);
  }
}