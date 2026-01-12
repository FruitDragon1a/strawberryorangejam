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