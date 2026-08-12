/** Erkennt zentral, ob die Oberfläche für Touch oder Desktop aufgebaut wird. */
export class InputDeviceDetector {
  /** Ab dieser Breite wird verbindlich das Desktoplayout verwendet. */
  static desktopMinWidth = 1024;

  /** Touchprofile, die trotz Laptopbreite bewusst mobil bedient werden. */
  static tabletViewports = Object.freeze([
    [1024, 768],
    [1180, 820],
    [1366, 1024],
    [1368, 912],
    [1280, 853],
    [1024, 600],
    [1280, 800],
  ]);

  /** Erlaubte Abweichung der Browser-Geräteprofile in CSS-Pixeln. */
  static viewportTolerance = 4;

  /**
   * Unterscheidet primäre Touchbedienung von Laptops mit zusätzlichem Touch.
   * @returns {boolean} Ob die mobile Touchoberfläche verwendet werden soll.
   */
  static isTouchLayout() {
    const hasPrimaryTouch = window.matchMedia(
      "(pointer: coarse) and (hover: none)",
    ).matches;
    if (this.isLocalTabletTest()) return true;
    if (window.innerWidth < this.desktopMinWidth) {
      return hasPrimaryTouch || this.isLocalTouchTest();
    }
    return hasPrimaryTouch && this.isRecognizedTablet();
  }

  /**
   * Trennt echte Mobilprofile von Touchsimulationen auf Desktop-Viewports.
   * @returns {boolean} Ob Browserkennung oder Maße zu einem Tablet gehören.
   */
  static isRecognizedTablet() {
    const longSide = Math.max(window.innerWidth, window.innerHeight);
    const shortSide = Math.min(window.innerWidth, window.innerHeight);
    const hasTabletViewport = this.tabletViewports.some(([width, height]) =>
      Math.abs(longSide - Math.max(width, height)) <= this.viewportTolerance &&
      Math.abs(shortSide - Math.min(width, height)) <= this.viewportTolerance);
    return hasTabletViewport || this.isCompactMobileBrowser();
  }

  /**
   * Erkennt nur kompakte Mobilbrowser; breite Ansichten brauchen Tabletmaße.
   * @returns {boolean} Ob ein echter Mobilbrowser unter Laptopbreite vorliegt.
   */
  static isCompactMobileBrowser() {
    const browser = globalThis.navigator;
    const userAgent = browser?.userAgent ?? "";
    const isMobileAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
    const isIPadOs = browser?.platform === "MacIntel" &&
      (browser?.maxTouchPoints ?? 0) > 1;
    const isMobileBrowser = browser?.userAgentData?.mobile === true ||
      isMobileAgent || isIPadOs;
    return isMobileBrowser && window.innerWidth < this.desktopMinWidth;
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
   * Aktiviert lokal eine große Touchansicht, ohne Desktopregeln zu verändern.
   * @returns {boolean} Ob das gesonderte Tablet-Testprofil aktiv ist.
   */
  static isLocalTabletTest() {
    if (!import.meta.env?.DEV) return false;
    return new URLSearchParams(window.location.search)
      .get("debugTouch") === "tablet";
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
