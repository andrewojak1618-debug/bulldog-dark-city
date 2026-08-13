/**
 * Manages input device detector behavior.
 */
export class InputDeviceDetector {
  /**
   * Handles freeze.
   */
  static desktopMinWidth = 1024;

  /**
   * Handles freeze.
   */
  static tabletViewports = Object.freeze([
    [1024, 768],
    [1180, 820],
    [1366, 1024],
    [1368, 912],
    [1280, 853],
    [1024, 600],
    [1280, 800],
  ]);

  /**
   * Checks the touch layout condition.
   */
  static viewportTolerance = 4;

  /**
   * Checks the touch layout condition.
   * @returns {boolean} Whether the requested condition is met.
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
   * Checks the recognized tablet condition.
   * @returns {boolean} Whether the requested condition is met.
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
   * Checks the compact mobile browser condition.
   * @returns {boolean} Whether the requested condition is met.
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
   * Checks the local touch test condition.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isLocalTouchTest() {
    if (!import.meta.env?.DEV) return false;
    return new URLSearchParams(window.location.search)
      .get("debugTouch") === "1";
  }

  /**
   * Checks the local tablet test condition.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isLocalTabletTest() {
    if (!import.meta.env?.DEV) return false;
    return new URLSearchParams(window.location.search)
      .get("debugTouch") === "tablet";
  }

  /**
   * Checks the portrait touch layout condition.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isPortraitTouchLayout() {
    return this.isTouchLayout() &&
      window.matchMedia("(orientation: portrait)").matches;
  }
}
