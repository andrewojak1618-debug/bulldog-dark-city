/**
 * Manages menu input controller behavior.
 */
export class MenuInputController {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Array<{isDisabled: boolean, setSelected: Function, activate: Function}>} buttons - The buttons value.
   * @param {Function|null} [onInputModeChange=null] - The on input mode change value.
   */
  constructor(scene, buttons, onInputModeChange = null) {
    this.scene = scene;
    this.buttons = buttons;
    this.activeIndex = this.findFirstEnabledIndex();
    this.isEnabled = true;
    this.onInputModeChange = onInputModeChange;
    this.gamepadState = { up: false, down: false, confirm: false };
    this.bindKeyboard();
    this.selectIndex(this.activeIndex);
  }

  /**
   * Finds first enabled index.
   * @returns {number} The resulting numeric value.
   */
  findFirstEnabledIndex() {
    return this.buttons.findIndex((button) => !button.isDisabled);
  }

  /**
   * Binds keyboard.
   * @returns {void} No value is returned.
   */
  bindKeyboard() {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) return;
    this.keyboardHandlers = this.createKeyboardHandlers();
    this.bindKeyboardEvents(keyboard);
    this.scene.events.once("shutdown", () => this.unbindKeyboard());
  }

  /**
   * Creates keyboard handlers.
   */
  createKeyboardHandlers() {
    return {
      up: (event) => this.handleKeyboardNavigation(event, -1),
      down: (event) => this.handleKeyboardNavigation(event, 1),
      confirm: (event) => this.handleKeyboardConfirmation(event),
    };
  }

  /**
   * Binds keyboard events.
   */
  bindKeyboardEvents(keyboard) {
    keyboard.on("keydown-UP", this.keyboardHandlers.up);
    keyboard.on("keydown-W", this.keyboardHandlers.up);
    keyboard.on("keydown-DOWN", this.keyboardHandlers.down);
    keyboard.on("keydown-S", this.keyboardHandlers.down);
    keyboard.on("keydown-ENTER", this.keyboardHandlers.confirm);
    keyboard.on("keydown-SPACE", this.keyboardHandlers.confirm);
  }

  /**
   * Handles keyboard navigation.
   * @param {KeyboardEvent} event - The triggering event.
   * @param {number} direction - The horizontal movement direction.
   * @returns {void} No value is returned.
   */
  handleKeyboardNavigation(event, direction) {
    if (!this.isEnabled || event.repeat) {
      return;
    }

    event.preventDefault();
    this.onInputModeChange?.("keyboard");
    this.moveSelection(direction);
  }

  /**
   * Handles keyboard confirmation.
   * @param {KeyboardEvent} event - The triggering event.
   * @returns {void} No value is returned.
   */
  handleKeyboardConfirmation(event) {
    if (!this.isEnabled || event.repeat) {
      return;
    }

    event.preventDefault();
    this.onInputModeChange?.("keyboard");
    this.activateCurrent();
  }

  /**
   * Handles unbind keyboard.
   * @returns {void} No value is returned.
   */
  unbindKeyboard() {
    const keyboard = this.scene.input.keyboard;

    if (!keyboard || !this.keyboardHandlers) {
      return;
    }

    keyboard.off("keydown-UP", this.keyboardHandlers.up);
    keyboard.off("keydown-W", this.keyboardHandlers.up);
    keyboard.off("keydown-DOWN", this.keyboardHandlers.down);
    keyboard.off("keydown-S", this.keyboardHandlers.down);
    keyboard.off("keydown-ENTER", this.keyboardHandlers.confirm);
    keyboard.off("keydown-SPACE", this.keyboardHandlers.confirm);
  }

  /**
   * Moves selection.
   * @param {number} direction - The horizontal movement direction.
   * @returns {void} No value is returned.
   */
  moveSelection(direction) {
    if (this.activeIndex < 0 || this.buttons.length === 0) {
      return;
    }

    let nextIndex = this.activeIndex;

    for (let step = 0; step < this.buttons.length; step += 1) {
      nextIndex =
        (nextIndex + direction + this.buttons.length) %
        this.buttons.length;

      if (!this.buttons[nextIndex].isDisabled) {
        this.selectIndex(nextIndex);
        return;
      }
    }
  }

  /**
   * Handles select index.
   * @param {number} index - The zero-based item index.
   * @returns {void} No value is returned.
   */
  selectIndex(index) {
    const button = this.buttons[index];

    if (!button || button.isDisabled) {
      return;
    }

    this.activeIndex = index;
    this.buttons.forEach((item, itemIndex) =>
      item.setSelected(itemIndex === index),
    );
  }

  /**
   * Handles focus button.
   * @param {{isDisabled: boolean, setSelected: Function, activate: Function}} button - The button value.
   * @param {"pointer"|"mouse"|"touch"} [inputMode="pointer"] - The input mode value.
   * @returns {void} No value is returned.
   */
  focusButton(button, inputMode = "pointer") {
    if (!this.isEnabled) {
      return;
    }

    this.onInputModeChange?.(inputMode);
    const index = this.buttons.indexOf(button);
    this.selectIndex(index);
  }

  /**
   * Handles activate current.
   * @returns {void} No value is returned.
   */
  activateCurrent() {
    if (!this.isEnabled) {
      return;
    }

    const button = this.buttons[this.activeIndex];

    if (!button || button.isDisabled) {
      return;
    }

    button.activate();
  }

  /**
   * Updates the current state.
   * @returns {void} No value is returned.
   */
  update() {
    if (!this.isEnabled) return;
    const gamepad = this.scene.input.gamepad?.getPad(0);
    if (!gamepad) return;
    const nextState = this.getGamepadState(gamepad);
    this.handleGamepadState(nextState);
    this.gamepadState = nextState;
  }

  /**
   * Returns gamepad state.
   */
  getGamepadState(gamepad) {
    return {
      up: Boolean(gamepad.up),
      down: Boolean(gamepad.down),
      confirm: Boolean(gamepad.buttons[0]?.pressed),
    };
  }

  /**
   * Handles gamepad state.
   */
  handleGamepadState(nextState) {
    if (nextState.up && !this.gamepadState.up) {
      this.onInputModeChange?.("gamepad");
      this.moveSelection(-1);
    }

    if (nextState.down && !this.gamepadState.down) {
      this.onInputModeChange?.("gamepad");
      this.moveSelection(1);
    }

    if (nextState.confirm && !this.gamepadState.confirm) {
      this.onInputModeChange?.("gamepad");
      this.activateCurrent();
    }
  }

  /**
   * Sets enabled.
   * @param {boolean} enabled - The enabled value.
   * @returns {void} No value is returned.
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}
