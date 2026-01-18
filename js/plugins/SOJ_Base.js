//=============================================================================
// SOJ Base - By TomatoRadio & FruitDragon
// SOJ_Base.js
//=============================================================================

var Imported = Imported || {};
Imported.SOJ_Base = true;

var SOJ = SOJ || {};
SOJ.BASE = SOJ.BASE || {};
SOJ.BASE.version = 1;

/*: 
 * @plugindesc 
 * @author TomatoRadio & FruitDragon
 * 
 * @help
 * 
 * 
*/

if (!Sprite_WindowCustomCursorVert) { //Should make it self compatible, if not, welp.

function Sprite_WindowCustomCursorVert() { this.initialize.apply(this, arguments); }
Sprite_WindowCustomCursorVert.prototype = Object.create(Sprite_WindowCustomCursor.prototype);
Sprite_WindowCustomCursorVert.prototype.constructor = Sprite_WindowCustomCursorVert;

Sprite_WindowCustomCursorVert.prototype.setupBitmap = function(name) {
  // Set Bitmap
  this.bitmap = ImageManager.loadSystem(name === undefined ? 'cursor_menu_vert' : name);
};

Sprite_WindowCustomCursorVert.prototype.updateCursorAnimation = function() {
  // Get Index
  const index = Math.floor(this._sineIndex);
  // Set Anchor Position
  this.anchor.y = this._sineYList[index];
  // Increase Sine Index
  this._sineIndex = (this._sineIndex + this._speed) % this._sineYList.length;
};

SOJ.BASE._upatecursor = Window_Selectable.prototype.updateCursor
Window_Selectable.prototype.updateCursor = function() {
  // If Using Custom Cursor Rect Sprite
  if (this.isUsingCustomCursorVertRectSprite()) {
    // If Custom Cursor Sprites Exist
  if (this._customCursorsSprites) {
    if (this._cursorAll && this._customCursorsSprites.length <= 0) {
      // Get Current Index
      var index = this.index();
      var mainSprite = this._customCursorRectSprite
      // Get Top Row
      var topRow = this.topRow();
      var maxCols = this.maxCols();
      var pageItems = this.maxPageItems();
      // Iterate Page Items
      for (var i = 0; i < pageItems; i++) {
        var tIndex = ((topRow * maxCols)  + i);
        // If Top index is the same as main sprite index
        if (tIndex === index) { continue; }
        // Create Sprite
        var sprite = new Sprite_WindowCustomCursorVert(tIndex, this.customCursorRectBitmapName());
        // Set Sprite Angle
        sprite._angle = mainSprite._angle;
        this._customCursorRectSpriteContainer.addChild(sprite);
        // Initialize Cursor Rect Sprite
        this._customCursorsSprites[i] = sprite;
      };
    } else if (this._customCursorsSprites.length > 0) {
      // Go Through Sprites
      for (var i = 0; i < this._customCursorsSprites.length; i++) {
        // Go Through Sprites
        var sprite = this._customCursorsSprites[i];
        // If Sprite exists set visibility
        if (sprite) { this._customCursorRectSpriteContainer.removeChild(sprite); };
      };
      // Clear Array
      this._customCursorsSprites = [];
    };
  };
  // Update Custom Rect Sprite
  this.updateCustomCursorRectSprite(this._customCursorRectSprite);
  if (this._customCursorsSprites) {
    // Go Through Sprites
    for (var i = 0; i < this._customCursorsSprites.length; i++) {
      // Go Through Sprites
      var sprite = this._customCursorsSprites[i];
      // If Sprite exists set visibility
      if (sprite) { this.updateCustomCursorRectSprite(sprite, sprite._index); };
    };
  };
  return;
  } else {
    // Run Original Function
    SOJ.BASE._upatecursor.call(this);
  };
};

Window_Selectable.prototype.isUsingCustomCursorVertRectSprite = function() { return false; };

Window_Selectable.prototype.initCustomCursorRect = function() {
  // Initialize Cursor Rect Sprite
  this._customCursorsSprites = [];
  // Create Custom Cursor Rect Sprite Container
  this._customCursorRectSpriteContainer = new Sprite();
  this.addChild(this._customCursorRectSpriteContainer);
  // Create Custom Cursor Rect Sprite
  this._customCursorRectSprite = this.isUsingCustomCursorVertRectSprite() ? new Sprite_WindowCustomCursorVert(undefined, this.customCursorRectBitmapName()) : new Sprite_WindowCustomCursor(undefined, this.customCursorRectBitmapName());
  this._customCursorRectSpriteContainer.addChild(this._customCursorRectSprite);
};

};

Window_OmoTitleScreenBox.prototype.isUsingCustomCursorVertRectSprite = function() { return true; }
Window_OmoTitleScreenBox.prototype.customCursorRectBitmapName = function() { return 'cursor_menu_vert'; }
Window_OmoTitleScreenBox.prototype.customCursorRectXOffset = function() { return (this.width/2); }
Window_OmoTitleScreenBox.prototype.customCursorRectYOffset = function() { return -40; }

SceneManager.initGraphics = function() {
    var type = this.preferableRendererType();
    Graphics.initialize(this._screenWidth, this._screenHeight, type);
    Graphics.boxWidth = this._boxWidth;
    Graphics.boxHeight = this._boxHeight;
    Graphics.setLoadingImage(`img/system/Loading_SOJ.png`);
    if (Utils.isOptionValid('showfps')) {
        Graphics.showFps();
    }
    if (type === 'webgl') {
        this.checkWebGL();
    }
};

Sprite_OmoMenuStatusFace.prototype.updateBitmap = function() {
  // Get Actor
  var actor = this.actor
  // If Actor Exists and it has Battle Status Face Name
  if (actor) {
    // Face Name
    let faceName
    if (this._inMenu) {
      // Get Face Name
      faceName = actor.menuStatusFaceName();
      // Change actor to the $dataActors actor
      actor = $dataActors[this.actor.actorId()];
      // Set Face Width & Height
      if (actor.meta.MenuStatusWidth) {
        this._faceWidth = actor.meta.MenuStatusWidth
      } else {
        this._faceWidth = 125;
      }
      if (actor.meta.MenuStatusHeight) {
        this._faceHeight = actor.meta.MenuStatusHeight
      } else {
        this._faceHeight = 125;
      }
    };
    // Set Default Face Name
    if (!faceName) {
      faceName = actor.battleStatusFaceName();
      // Set Face Width & Height
      this._faceWidth = 106;
      this._faceHeight = 106;
    };
    // Set Bitmap
    this.bitmap = ImageManager.loadFace(faceName);
  } else {
    this.bitmap = null;
  };
  // Update Frame
  this.updateFrame();
};

function isTextInCurrentLanguage(text) {return true;};

Scene_Map.prototype.updateCharacterTagInput = function() {
  // If Input Trigger A
  if (Input.isTriggered('tag')) {
    // If Can use Character Tag
    if (this.canUseCharacterTag()) {  
      // Get Tag
      $gameSwitches.setValue(8,true)
    };
  };  
};

Scene_Map.prototype.canUseCharacterTag = function() { 
  // If Event is running return false
  if ($gameMap.isEventRunning()) { return false; };
  // If Party size is 1 or less
  // If Disable Switch is on return false
  if ($gameSwitches.value(_TDS_.MapCharacterTag.params.disableSwitchID)) { return false; }
  let scene = SceneManager._scene;
  let isProcessingAnyMovement = !!$gamePlayer.isMoving() || !!$gamePlayer.followers().areMoving() || Input.isPressed("left") || Input.isPressed("right") || Input.isPressed("up") || Input.isPressed("down");
  if (!!isProcessingAnyMovement) {return false;}
  // Return true by default
  return true;
};

Game_Interpreter.prototype.forceKelMove = function(idA,x,y,wait) {
    // Create Move Route Object
    var route = { list: [], repeat: false, skippable: true, wait: true };
    // Get Direction

    // Add Script call to move route
    route.list.push({ code: 45, parameters: [`MOVE TO: ${x}, ${y}`] });
    // Add Wait command to move route
    route.list.push({ code: 0, parameters: [] });
            
    // Get Event (Using argument for ID)
    var event = $gameMap.event(idA)
        // Force event to follow move route
    event.forceMoveRoute(route);
    // Set Character for wait tracking
    this._character = event;
    // Set Wait mode so it waits until character is done moving before running other commands
    if (wait) {this.setWaitMode('route')};
}

//Draws icons aligned with the actual text
Window_Base.prototype.processDrawInputIcon = function(input, textState) {
  // Get Key
  const offset_data = LanguageManager.getMessageData("XX_BLUE.Window_Base").processDrawInputIconOffset
  var key = Input.inputKeyCode(input);
  // Get Rect
  var rect = this.contents.keyIconRects(key).up;
  // Add Padding Space
  textState.x += 4;
  // Draw Key Icon
  this.contents.drawAlginedKeyIcon(key, textState.x + offset_data[0], textState.y + offset_data[1] + 10, rect.width, textState.height);
  // Increase Texstate X position
  textState.x += rect.width + 4;
};
/*
//Dumb stupid code
Sprite_Balloon.prototype.initMembers = function() {
    this._balloonId = 0;
    this._duration = 0;
    this.anchor.x = 0.5;
    this.anchor.y = 1;
    if (this.parent) {
      var event = this.parent._character instanceof Game_Player ? $gamePlayer : this.parent._character.event();
      var anchorX = event && event.meta && event.meta.BalloonX ? Number(event.meta.BalloonX) : 0.5;
      var anchorY = event && event.meta && event.meta.BalloonY ? Number(event.meta.BalloonY) : 1;
      if (typeof event._balloonX === "number") anchorX = event._balloonX;
      if (typeof event._balloonY === "number") anchorY = event._balloonY;
      this.anchor.x = anchorX;
      this.anchor.y = anchorY;
    };
    this.z = 7;
};*/

// MENU ALTERATIONS
Scene_Menu.prototype.createCommandWindow = function() {
  // If Command Window Does Not Exist
  if (!this._commandWindow) {
    // Create Command Window
    this._commandWindow = new Window_MenuCommand(10, 10);
  } else {
    this._commandWindow.refresh();
  };
  this._commandWindow.activate();
  this._commandWindow.setHandler('save',      this.commandSave.bind(this));
  this._commandWindow.setHandler('item',      this.onPersonalOk.bind(this));
  this._commandWindow.setHandler('badge',     this.commandBadge.bind(this));
  this._commandWindow.setHandler('options',   this.commandOptions.bind(this));
  this._commandWindow.setHandler('cancel',    this.popScene.bind(this));
  this.addWindow(this._commandWindow);
};

Scene_Menu.prototype.commandSave = function() {
  SceneManager.push(Scene_OmoriFile);
  SceneManager._nextScene.setup(!$gameSwitches.value(2088), true);
};

Scene_Menu.prototype.commandBadge = function() {
  SceneManager.push(DGT.BadgeScene);
};

Window_MenuCommand.prototype.makeCommandList = function () {
  // Get Command Text
  var text = $gameSwitches.value(2088) ? ["LOAD","POCKET","BADGES","OPTIONS"] : ["SAVE","POCKET","BADGES","OPTIONS"];

  this.addCommand(text[0], 'save');
  this.addCommand(text[1], 'item', $gameParty.hasValidPocketItems());
  this.addCommand(text[2], 'badge');
  this.addCommand(text[3], 'options');
};

Window_MenuCommand.prototype.spacing = function () {  return 20; };

Game_System.prototype.addJukeboxItem = function(songID) {
    this._jukeboxList.push(this._jukeboxListFull[songID]);
    $gameParty.gainItem($dataItems[songID], -1)
    var jukeboxCDs = [ // IDs of CD items (in the database)
        198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210
    ];
    if (this._jukeboxList.length >= jukeboxCDs.length){
        //$gameSystem.unlockAchievement("MUSIC_CONNOISSEUR_OF_SORTS")
    }
}

SOJ.vnFrame = function(kel,basil,open) {
  const shadow = $gameScreen.picture(50);
  if (open === true) {
    shadow._targetOpacity = 255;
  } else if (open === false) {
    shadow._targetOpacity = 0;
  };
  shadow._duration = 10;
  if (kel >= 0) {
    $gameMap._interpreter.setPictureFrameIndex(40, kel);
  };
  if (basil >= 0) {
    $gameMap._interpreter.setPictureFrameIndex(41, basil);
  };
};

SOJ.printStupidText = function() {
  console.log( ['&&&&&&Xxxxxx+;;;;;;;;;;;;::::::::::::::.....;...............................................................................',
                '&&&&&&$XXxxxxxx++++++;;;;::::::::::::::::...:...............................................................................',
                '&&&&&&&$$XXxxxxxx++++;;;;;:::::::::::::::::..::.............................................................................',
                '&&&&&&&$$XXxxxxxxxxxxx+++;;;;:::::::::::::::.+;.............................................................................',
                '&&&&&&&&$$$XXxxxxxxxxxxxx+;;;;;::::::::::::::x+.............................................................................',
                '&&&&&&&&$$$XXXX$$Xxxxxxxxx+;;;;;;::;:::::::::$$.............................................................................',
                '&&&&&&&&&$XXXX$$$XXXxxxxxxxx+;;;;;;;;;;;;:::xx..................;;::...........:............................................',
                '&&&&&&&&&$XXX$$$$XXXXxxxxxxxxx+;++++;;;;;:::xX...............:;....::;;:::.....;............................................',
                '&&&&&&&&&&XX$$$$XXXXxxxxxxxxxxxxx++++;;;;:::::+$$x.........:::...:;;;;;::.....;;............................................',
                '&&&&&&&&&&&$$$$XXXXXXxxxxxxxxxxxxxx++;;;;;:::::&X........:.::...:;;;;::::..::;;;;:;:.:......................................',
                '&&&&&&&&&&&&$$$XxXXXxxxxxxxxxxxxxxxxxxxx;:::::::x:....:::::;...:::::::.....:::::::::::...:..................................',
                '&&&&&&&&&&&&&$$XxxXXxxxxxxxxxxxxxxxxxxx;;;:::::::;..;$x;x:::...............::::::::::::;:.;.................................',
                '&&&&&&&&&&&&&&$xxxxXXxxxxxxxxxx$&$xxx+;;;;;::::..::..;&&:::.....:::::...:::;;;;;::::::::::::................................',
                '&&&&&&&&&&&&&&&$xxxXXXXXXxxxx$&$Xxx+;;;;;;::::::::::::.:$x......$x::.xx:;;;;;;;;;;;:::::....................................',
                '&&&&&&&&&&&&&&&&$xXxXX$XXXX$$$xxxxx+;;;;;;;::::::::::::.:X..xx...:..:....:;;;;;;;::::.::::..................................',
                '&&&&&&&&&&&&&&&&&&XxxX$$$&&$$Xxxxxx+;;;;;;;:::::::::::::::::x$x........;;;;;::::::::::............:.........................',
                '&&&&&&&&&&&&&&&&&&&XX$&&&$$$XXXxxxxx;;;;;:;::::::::::::::..::&x..::::..:;;;;:::::................:........................::',
                '&&&&&&&&&&&&&&&&&&&&&&&$$$$$$Xxxxxxx+;;;;;;;;::::::::::::.::&&...::::::.:::::..:................:.........................::',
                '&&&&&&&&&&&&&&&&&&&&&$$$$$$$$Xxxxxxx+;;;;;;;;:;::::::::::::$&....:::;;:x+;;;:..+.........:...:::..........................::',
                '&&&&&&&&&&&&&&&&&&&&&$XXX$$$XXxxxxxxx+;;+;++xx+;:::::::::::x&:...::;;;++;::................::::..:..::.....................:',
                '&&&&&&&&&&&&&&&&&&&&&$XXX$$XXxxxxxxxxxxxxx+;;;;:::::::::::::&$..:::;;;;;:................::::::::..........................:',
                '&&&&&&&&&&&&&&&&&&&&&&XXX$$$$X$$$$xxxx+++++;;;;;:::::::::::.+&:.:::;;;:::.........:;...:::::::::::::.......................:',
                '&&&&&&&&&&&&&&&&&&&&&&$$&&&&&&$Xxxxx+++++++;;:::::::::::::::.$$::::::::x::......:;....:;::::::::::::.......................:',
                '&&&&&&&&&&&&&&&&&&&&&&&&&$$$$Xxxxxxx+++++++;;:::::::::::::...+&:::::::xx&x....;x:.:.:x+;::::;;;;:::........................:',
                '&&&&&&&&&&&&&&&&&&&&&&XX$$$$XXxxxxxxxx++;+;;;;;:::::::::.::.:&x::::::X.;&&Xx;....::x$x;::::;;;;:::.........................:',
                '&&&&&&&&&&&&&&&&&&&&&$XX$$$$$$xxxxxxxxxxx;:;x+x+;:::::::::.:Xx:.::.;;.........:&&&&$+::::::::;::::..........................',
                '&&&&&&&&&&&&&&&&&&&&&XXX$$$$$XXxxX$XXx::.....:+x;;:::::::::$$....:;:.........:;+&&x:..::;;;;::::............................',
                '&&&&&&&&&&&&&&&&&&&&XXXXX$$$$XX$&&;:.......::xx+:;;:::::::&$:...:;.........X$+::......&$;::;:::.................X$$xx;:::::.',
                '&&&&&&&&&&&&&&&&&&&&xxXXXXX$&&$$x::.....:::+xx+;;;;:;;:::::xxxx;:.........;&+:.........&x::::.................;&&&&$Xx;:;;;;',
                '&&&&&&&&&&&&&&&&&&&$XXXXX&&&&x:;:....::;xXx+;;;;;:::::::::::::::::.......:$x:..........x&;..:................;$&&&&$x+::::::',
                '&&&&&&&&&&&&&&&&&&$X$$&&$x+;;;...::+xxXx+;;;;;;;;;::::::::::::::::......;xx:...........:&x..................:&&&&xxx+;xx;;;:',
                '&&&&&&&&&&&&&&&&&$$$&&&&++x:..::;+xxxxx++;;;;;;;;;;:::::::::::::::....X$;::............:&&;.................$&&&$$$X$$Xx;:::',
                '&&&&&&&&&&&&&&&&$$&&&&&&&:.:;+xX$Xxxxxx++;;;;;;;;;::::::::::::::::..$Xx+...............x&&&x...............X&&&&&&&&$$$&$x+;',
                '&&&&&&&&&&&&$$XX&&&&&&X:.:+x$$XXx+x+++;+;;;;;;;:::::::::::::::::::;&X;:................;&&&X;.............+&&&&&$xxx;;:;;xxx',
                'X&&&$$x$&$xxxxx&&&&$$::+xx$$$xxxx+x+;;++++;;;;:::::::::::::::::::;&x....................:++:..............:&&&+;+xxxxxxxx;;;',
                ';::::::;;;xxX$X$$xX;::;x&&&$xxxx++++++;;;;;;::::::::::::::::::::xx$:....+..........;......................$&&&&&$x:::;;+xxxx',
                'xx+::::xxxxx&&&xxx:;x$&&$Xxxxxxx+;;;;;;;;;;::::::::::::::::..:.+$:.....:.........;+....................x&&&&x;::;++;::::::::',
                'x$$x;:::;xx&&$xx:;X$&&$xxxxxxxxx+xx+;;;;;;:::::::::::::::::...:&x:...;;.........;;..................:$&&&x:.................',
                '+X$x:..:;x$&$xx+Xxxxxxxxxx+;;;;;;;;;;++;;;:::::::::::::::::..+X&;...x;.....:::;x+..................&&&x;::.................:',
                ';x$x:..;$&&$Xx$&&$$xxxxx++;;;;;::;;;;:::;;;:::::::::::+&&&&&&$$$;:.x:.....:;;x:...................:$$x+;.................:::',
                'X$&x;:.+&&&xx&&$xxxxxxx++;;;;;;:::::::::::::::::::.x&$X&&+::;x++;.x;....:::+;.......$&x&&&x:...:xXxx;:...................:::',
                '.........$++:x&+.++xxxx+;;;;;;:::::::::::::::::$x..+;xx:....:::;:+;....::xX&&$$$xx;$&&x&$xX&&&x$:.....................::::::',
                'xx:...........;x;;;+++++;;:;:::::::::::::::::;;...+xxx::+......:;x.....;x+;:..::.:x&&$xxxxx&&xX&&&x:..............:::::::::;',
                '................;;;x+;;;:::::::::::::::::.x&&&&x:;xxx;.:xX:....;;.....++$+;:.:.......:::......:$XX;:.............:::::;;;;;;',
                '.................;:.::::::::::::::::::::;&&$.;&&$xxx:.....xxx..::....:+xxx+;...x..................:$&$:.........:::::;;;;;;;',
                '..........+xx.......:..:::::::::::::::::X&&;&&&&x;:........x:.::....:xXx:::.......................:::;.........::::;;+x+;::;',
                '....::....::.........+..:::::::::::::::X&&&&&&&X+:.................x$$x;::............................:x+:.....:;;+;;$X..:;;',
                '.........................::::::::::::$&&+:;;$&&x;;:...............;xXxx;:..............................:;.:...:::;;+X$..::::',
                '.........................:xXXXXxxxxX&&&+:::..x&$x+;:.............:$$$x;:................................:;...:;;;;+x:.......',
                '.........................xXXxxxxxxx$&&&::;:...x&$xx:............;Xx+;;:................................:;&x;:.:::...........',
                '........................;$$XXXXXXX$$&&&;+;..:x;&&Xx::..........::::::..................................::...................'].join('\n'));
};

var SkinnedWindows = [Window_Message,Window_NameBox,Window_MessageFaceBox,Window_ChoiceList,Window_NumberInput,Window_EventItem];
var defaultWindowskin = "Window";
/*
SOJ.BASE.loadWindowskin = Window_Base.prototype.loadWindowskin;
Window_Base.prototype.loadWindowskin = function() {
	SOJ.BASE.loadWindowskin.call(this); //This is so that extra stuff like BABY_ExternalColorImage.js don't get deleted.
	this.windowskin = ImageManager.loadSystem(defaultWindowskin);
};
*/
SkinnedWindows.forEach(function(win) {
	win.prototype.loadWindowskin = function() {
		Window_Base.prototype.loadWindowskin.call(this);
		var wskin = $gameSystem.windowskin() || defaultWindowskin;
		this.windowskin = ImageManager.loadSystem(wskin);
	};
});

SOJ.textColor = Window_Base.prototype.textColor;
Window_Base.prototype.textColor = function(n) {
	if (n === 0) return "#fff";
	return SOJ.textColor.call(this,n);
};