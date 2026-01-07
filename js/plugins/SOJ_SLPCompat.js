//=============================================================================
 /*:
 * @author 
 * @plugindesc
 *
 *
 */
//=============================================================================

Game_Actor.prototype.faceSaveLoad = function() {
  var actor = this.actor();
  // When changing these the .png should not be required.
  switch (actor.id) {
    case 1: // Omori
    return "01_OMORI_BATTLE";
    case 2: // Aubrey
    return "02_AUBREY_BATTLE";
    case 3: // Kel
    return "03_KEL_BATTLE";
    case 4: // Hero
    return "04_HERO_BATTLE";
    case 8: // Omori
    return "01_FA_OMORI_BATTLE";
    case 9: // Aubrey
    return "02_FA_AUBREY_BATTLE";
    case 10: // Kel
    return "03_FA_KEL_BATTLE";
    case 11: // Hero
    return "04_FA_HERO_BATTLE";
    case 23: //basil
    return "SOJ_BASIL_BATTLE";
    default:
      return "default_face_image_here"; // if ther is one?
  }
};

Scene_OmoriFile.prototype.loadReservedBitmaps = function() {
  // Super Call
  Scene_Base.prototype.loadReservedBitmaps.call(this);
  // Go through face
  ImageManager.reserveFace("01_OMORI_BATTLE", 0, this._imageReservationId);
  ImageManager.reserveFace("02_AUBREY_BATTLE", 0, this._imageReservationId);
  ImageManager.reserveFace("03_KEL_BATTLE", 0, this._imageReservationId);
  ImageManager.reserveFace("04_HERO_BATTLE", 0, this._imageReservationId);
  ImageManager.reserveFace("01_FA_OMORI_BATTLE", 0, this._imageReservationId);
  ImageManager.reserveFace("02_FA_AUBREY_BATTLE", 0, this._imageReservationId);
  ImageManager.reserveFace("03_FA_KEL_BATTLE", 0, this._imageReservationId);
  ImageManager.reserveFace("04_FA_HERO_BATTLE", 0, this._imageReservationId);
  ImageManager.reserveFace("SOJ_BASIL_BATTLE", 0, this._imageReservationId);

  ImageManager.reserveSystem('loadscreen_backgrounds', 0, this._imageReservationId);
  ImageManager.reserveBattleback1('battleback_bookshelf', 0, this._imageReservationId);
  ImageManager.reserveParallax('!parallax_black_space', 0, this._imageReservationId);
  ImageManager.reserveParallax('Space_parallax', 0, this._imageReservationId);
  ImageManager.reserveParallax('!polaroidBG_FA_day', 0, this._imageReservationId);
  ImageManager.reserveSystem('VISION',0,this._imageReservationId);
};