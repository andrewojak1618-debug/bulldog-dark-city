/** Gemeinsame, fehlertolerante Wiedergabe für Abschlussvideos. */
export class EndingVideoSystem {
  /**
   * Startet ein Szenenvideo und aktiviert bei einem synchronen Fehler den Fallback.
   * @param {Phaser.Scene} scene - Game-Over- oder Victory-Szene.
   * @returns {void}
   */
  static start(scene) {
    try {
      scene.video.play(false);
    } catch {
      scene.showFallback();
    }
  }

  /**
   * Skaliert den ersten verfügbaren Videoframe exakt auf das Canvas.
   * @param {Phaser.Scene} scene - Szene mit Video und Skalierungszustand.
   * @returns {void}
   */
  static sizeAndReveal(scene) {
    if (scene.isVideoSized || !scene.video) return;
    const { width, height } = scene.scale;
    scene.isVideoSized = true;
    scene.video.setDisplaySize(width, height).setAlpha(1);
  }
}
