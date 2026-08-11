/** Stellt gemeinsame Loader-Hilfen für konfigurierte Assets bereit. */
export class AssetLoaderSystem {
  /**
   * Laedt ein Bild nur, wenn dessen Textur noch nicht im Cache liegt.
   * @param {Phaser.Scene} scene - Szene mit aktivem Phaser-Loader.
   * @param {{key: string, path: string}} asset - Assetkonfiguration.
   * @returns {boolean} `true`, wenn das Bild neu eingereiht wurde.
   */
  static loadImage(scene, asset) {
    if (scene.textures.exists(asset.key)) return false;
    scene.load.image(asset.key, asset.path);
    return true;
  }

  /**
   * Lädt ein gleichmäßig gerastertes Sprite-Sheet.
   * @param {Phaser.Scene} scene - Szene mit aktivem Phaser-Loader.
   * @param {{key: string, path: string, frameWidth: number, frameHeight: number}} asset - Assetkonfiguration.
   * @returns {boolean} `true`, wenn das Sprite-Sheet neu eingereiht wurde.
   */
  static loadSpritesheet(scene, asset) {
    if (scene.textures.exists(asset.key)) return false;
    scene.load.spritesheet(asset.key, asset.path, {
      frameWidth: asset.frameWidth,
      frameHeight: asset.frameHeight,
    });
    return true;
  }

  /**
   * Laedt Audio nur, wenn der Schluessel noch nicht im Cache liegt.
   * @param {Phaser.Scene} scene - Szene mit aktivem Phaser-Loader.
   * @param {{key: string, path: string|string[]}} asset - Audiokonfiguration.
   * @returns {boolean} `true`, wenn die Audiodatei neu eingereiht wurde.
   */
  static loadAudio(scene, asset) {
    if (scene.cache.audio.exists(asset.key)) return false;
    scene.load.audio(asset.key, asset.path);
    return true;
  }
}
