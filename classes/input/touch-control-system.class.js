import { BULLDOG_EVENTS } from
  "../../js/config/bulldog-animation-settings.js";
import {
  createTouchControlLayout,
  TOUCH_ACTIONS,
  TOUCH_CONTROLS,
} from
  "../../js/config/touch-control-settings.js";
import { TouchControlButton } from
  "../ui/touch-control-button.class.js";
import { InputDeviceDetector } from
  "./input-device-detector.class.js";

/**
 * Manages touch control system behavior.
 */
export class TouchControlSystem {
  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {import("./input-system.class.js").InputSystem} input - The active input system.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {{showThrowControls?: boolean}} [options={}] - The optional configuration values.
   * @returns {TouchControlSystem} The created instance.
   */
  static create(scene, input, player, options = {}) {
    return new TouchControlSystem(scene, input, player, options);
  }

  /**
   * Checks the supported condition.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isSupported() {
    return InputDeviceDetector.isTouchLayout();
  }

  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {import("./input-system.class.js").InputSystem} input - The active input system.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {{showThrowControls?: boolean}} options - The optional configuration values.
   */
  constructor(scene, input, player, options) {
    this.scene = scene;
    this.input = input;
    this.player = player;
    this.isDisabled = false;
    this.isTouchLayoutVisible = false;
    this.throwAvailability = new Map();
    this.initializeCallbacks();
    this.buttons = this.createButtons(options.showThrowControls);
    this.updateControlLayout();
    this.hideEmptyThrowControls();
    this.updateLayoutVisibility();
    this.bindLifecycle();
  }

  /**
   * Initializes callbacks.
   */
  initializeCallbacks() {
    this.releaseControls = () => this.releaseAll();
    this.handleViewportChange = () => this.refreshViewportLayout();
    this.preventContextMenu = (event) => event.preventDefault();
  }

  /**
   * Handles refresh viewport layout.
   */
  refreshViewportLayout() {
    this.releaseAll();
    this.updateControlLayout();
    this.updateLayoutVisibility();
  }

  /**
   * Creates buttons.
   * @param {boolean} showThrowControls - The show throw controls value.
   * @returns {TouchControlButton[]} The resulting collection.
   */
  createButtons(showThrowControls) {
    const controls = this.getVisibleControls(showThrowControls);
    return controls.map((settings) =>
      this.createButton(settings),
    );
  }

  /**
   * Creates button.
   * @param {Object} settings - The configuration values to use.
   * @returns {TouchControlButton} The created instance.
   */
  createButton(settings) {
    return new TouchControlButton(
      this.scene,
      settings,
      (action, isPressed) => this.input.setTouchAction(action, isPressed),
    );
  }

  /**
   * Returns visible controls.
   * @param {boolean} showThrowControls - The show throw controls value.
   * @returns {Object[]} The resulting collection.
   */
  getVisibleControls(showThrowControls = false) {
    return TOUCH_CONTROLS.controls.filter(
      (control) => showThrowControls || !control.throwControl,
    );
  }

  /**
   * Updates control layout.
   * @returns {void} No value is returned.
   */
  updateControlLayout() {
    const layout = this.createCurrentLayout();
    const positions = new Map(layout.map((entry) => [entry.action, entry]));
    this.buttons.forEach((button) => {
      const position = positions.get(button.settings.action);
      if (position) button.setPosition(position.x, position.y);
    });
  }

  /**
   * Creates current layout.
   * @returns {Object[]} The resulting collection.
   */
  createCurrentLayout() {
    const viewport = window.visualViewport ?? window;
    return createTouchControlLayout(
      this.scene.scale.width,
      this.scene.scale.height,
      viewport.width ?? window.innerWidth,
      viewport.height ?? window.innerHeight,
      this.getSafeAreaInsets(),
    );
  }

  /**
   * Returns safe area insets.
   * @returns {{left: number, right: number, bottom: number}} The resulting numeric value.
   */
  getSafeAreaInsets() {
    const bounds = this.scene.game.canvas.getBoundingClientRect();
    const scaleX = bounds.width > 0 ? this.scene.scale.width / bounds.width : 1;
    const scaleY = bounds.height > 0 ? this.scene.scale.height / bounds.height : 1;
    return {
      left: this.readSafeAreaValue("--safe-area-left") * scaleX,
      right: this.readSafeAreaValue("--safe-area-right") * scaleX,
      bottom: this.readSafeAreaValue("--safe-area-bottom") * scaleY,
    };
  }

  /**
   * Reads safe area value.
   * @param {string} property - The property value.
   * @returns {number} The resulting numeric value.
   */
  readSafeAreaValue(property) {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(property);
    return Number.parseFloat(value) || 0;
  }

  /**
   * Hides empty throw controls.
   * @returns {void} No value is returned.
   */
  hideEmptyThrowControls() {
    this.buttons.filter((button) => button.settings.throwControl)
      .forEach((button) => {
        this.throwAvailability.set(button.settings.action, false);
        button.setControlEnabled(false);
        button.setControlVisible(false);
      });
  }

  /**
   * Binds throw inventory.
   * @param {import("../systems/throw-bone-inventory.class.js").ThrowBoneInventory} inventory - The active inventory instance.
   * @returns {void} No value is returned.
   */
  bindThrowInventory(inventory) {
    this.throwInventoryUnsubscribe?.();
    this.throwInventoryUnsubscribe = inventory.onChange((type, count) => {
      this.updateThrowControl(type, count);
    });
  }

  /**
   * Updates throw control.
   * @param {"normal"|"nuclear"} type - The requested item type.
   * @param {number} count - The count value.
   * @returns {void} No value is returned.
   */
  updateThrowControl(type, count) {
    const action = type === "normal" ?
      TOUCH_ACTIONS.normalBone : TOUCH_ACTIONS.nuclearBone;
    const button = this.buttons.find(
      (candidate) => candidate.settings.action === action,
    );
    if (!button) return;
    const isAvailable = count > 0;
    this.throwAvailability.set(action, isAvailable);
    button.setControlEnabled(isAvailable);
    button.setControlVisible(
      this.isTouchLayoutVisible && !this.isDisabled && isAvailable,
    );
  }

  /**
   * Updates layout visibility.
   * @returns {void} No value is returned.
   */
  updateLayoutVisibility() {
    this.isTouchLayoutVisible = TouchControlSystem.isSupported();
    this.buttons.forEach((button) => {
      const isThrowControl = Boolean(button.settings.throwControl);
      const isAvailable = !isThrowControl ||
        this.throwAvailability.get(button.settings.action) === true;
      button.setControlVisible(
        this.isTouchLayoutVisible && !this.isDisabled && isAvailable,
      );
    });
  }

  /**
   * Binds lifecycle.
   * @returns {void} No value is returned.
   */
  bindLifecycle() {
    this.player.once(BULLDOG_EVENTS.knockedOut, () => this.disable());
    this.bindWindowLifecycle();
    this.bindSceneLifecycle();
  }

  /**
   * Binds window lifecycle.
   */
  bindWindowLifecycle() {
    window.addEventListener("blur", this.releaseControls);
    window.addEventListener("resize", this.handleViewportChange);
    window.addEventListener("orientationchange", this.handleViewportChange);
    window.visualViewport?.addEventListener(
      "resize",
      this.handleViewportChange,
    );
    document.addEventListener("visibilitychange", this.releaseControls);
  }

  /**
   * Binds scene lifecycle.
   */
  bindSceneLifecycle() {
    this.scene.game.canvas.addEventListener(
      "contextmenu",
      this.preventContextMenu,
    );
    this.scene.events.once("shutdown", () => this.destroy());
  }

  /**
   * Handles release all.
   * @returns {void} No value is returned.
   */
  releaseAll() {
    this.buttons.forEach((button) => button.release());
    this.input.clearTouchState();
  }

  /**
   * Handles disable.
   * @returns {void} No value is returned.
   */
  disable() {
    this.isDisabled = true;
    this.buttons.forEach((button) => button.setControlEnabled(false));
    this.buttons.forEach((button) => button.setControlVisible(false));
    this.input.clearTouchState();
  }

  /**
   * Releases the current state.
   * @returns {void} No value is returned.
   */
  destroy() {
    this.releaseAll();
    this.throwInventoryUnsubscribe?.();
    this.throwInventoryUnsubscribe = null;
    this.unbindWindowLifecycle();
    this.unbindSceneLifecycle();
  }

  /**
   * Handles unbind window lifecycle.
   */
  unbindWindowLifecycle() {
    window.removeEventListener("blur", this.releaseControls);
    window.removeEventListener("resize", this.handleViewportChange);
    window.removeEventListener(
      "orientationchange",
      this.handleViewportChange,
    );
    window.visualViewport?.removeEventListener(
      "resize",
      this.handleViewportChange,
    );
    document.removeEventListener("visibilitychange", this.releaseControls);
  }

  /**
   * Handles unbind scene lifecycle.
   */
  unbindSceneLifecycle() {
    this.scene.game.canvas.removeEventListener(
      "contextmenu",
      this.preventContextMenu,
    );
  }
}
