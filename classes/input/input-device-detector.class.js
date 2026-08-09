/** Erkennt zentral, ob die Oberfläche für Touch oder Desktop aufgebaut wird. */
export class InputDeviceDetector {
  /** Ab dieser Breite wird unabhängig von Touch das Desktoplayout genutzt. */
  static desktopMinWidth = 1024;

  /**
   * Unterscheidet primäre Touchbedienung von Laptops mit zusätzlichem Touch.
   * @returns {boolean} Ob die mobile Touchoberfläche verwendet werden soll.
   */
  static isTouchLayout() {
    if (window.innerWidth >= this.desktopMinWidth) return false;
    const hasPrimaryTouch = window.matchMedia(
      "(pointer: coarse) and (hover: none)",
    ).matches;
    if (hasPrimaryTouch) return true;
    return this.isLocalTouchTest();
  }

  /**
   * Erkennt den lokalen URL-Schalter für responsive Touchtests.
   * @returns {boolean} Ob der lokale Touch-Testmodus aktiv ist.
   */
  static isLocalTouchTest() {
    if (!import.meta.env?.DEV) return false;
    return new URLSearchParams(window.location.search)
      .get("debugTouch") === "1";
  }

  /**
   * Prüft, ob ein Touchlayout aktuell im Hochformat dargestellt wird.
   * @returns {boolean} Ob der Querformat-Hinweis angezeigt werden muss.
   */
  static isPortraitTouchLayout() {
    return this.isTouchLayout() &&
      window.matchMedia("(orientation: portrait)").matches;
  }
}
