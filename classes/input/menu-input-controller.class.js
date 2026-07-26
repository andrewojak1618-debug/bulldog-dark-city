/**
 * Bündelt Maus-, Touch-, Tastatur- und Gamepad-Steuerung des Hauptmenüs.
 */
export class MenuInputController {
  /**
   * Erstellt die Eingabesteuerung für eine Liste von Menübuttons.
   * @param {Phaser.Scene} scene - Szene, die die Eingaben empfängt.
   * @param {import("../ui/menu-button.class.js").MenuButton[]} buttons - Steuerbare Buttons.
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
   * Findet den ersten ausführbaren Menüpunkt.
   * @returns {number} Index oder `-1`, wenn kein Button aktiv ist.
   */
  findFirstEnabledIndex() {
    return this.buttons.findIndex((button) => !button.isDisabled);
  }

  /**
   * Verknüpft Pfeiltasten, W/S, Enter und Leertaste.
   * @returns {void}
   */
  bindKeyboard() {
    const keyboard = this.scene.input.keyboard;

    if (!keyboard) {
      return;
    }

    this.keyboardHandlers = {
      up: (event) => this.handleKeyboardNavigation(event, -1),
      down: (event) => this.handleKeyboardNavigation(event, 1),
      confirm: (event) => this.handleKeyboardConfirmation(event),
    };

    keyboard.on("keydown-UP", this.keyboardHandlers.up);
    keyboard.on("keydown-W", this.keyboardHandlers.up);
    keyboard.on("keydown-DOWN", this.keyboardHandlers.down);
    keyboard.on("keydown-S", this.keyboardHandlers.down);
    keyboard.on("keydown-ENTER", this.keyboardHandlers.confirm);
    keyboard.on("keydown-SPACE", this.keyboardHandlers.confirm);
    this.scene.events.once("shutdown", () => this.unbindKeyboard());
  }

  /**
   * Navigiert bei einem neuen Tastendruck genau einmal.
   * @param {KeyboardEvent} event - Auslösendes Tastaturereignis.
   * @param {number} direction - Bewegungsrichtung `-1` oder `1`.
   * @returns {void}
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
   * Bestätigt die aktuelle Auswahl bei einem neuen Tastendruck.
   * @param {KeyboardEvent} event - Auslösendes Tastaturereignis.
   * @returns {void}
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
   * Entfernt alle registrierten Tastaturereignisse beim Szenenwechsel.
   * @returns {void}
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
   * Verschiebt die Auswahl zyklisch und überspringt gesperrte Buttons.
   * @param {number} direction - Bewegungsrichtung `-1` oder `1`.
   * @returns {void}
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
   * Wählt einen ausführbaren Button aus.
   * @param {number} index - Index des gewünschten Buttons.
   * @returns {void}
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
   * Übernimmt einen mit Maus oder Touch fokussierten Button.
   * @param {import("../ui/menu-button.class.js").MenuButton} button - Fokussierter Button.
   * @returns {void}
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
   * Führt den aktuell ausgewählten Menüpunkt entprellt aus.
   * @returns {void}
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
   * Prüft Gamepad-Steuerkreuz und A-Taste auf neue Betätigungen.
   * @returns {void}
   */
  update() {
    if (!this.isEnabled) {
      return;
    }

    const gamepad = this.scene.input.gamepad?.getPad(0);

    if (!gamepad) {
      return;
    }

    const nextState = {
      up: Boolean(gamepad.up),
      down: Boolean(gamepad.down),
      confirm: Boolean(gamepad.buttons[0]?.pressed),
    };

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

    this.gamepadState = nextState;
  }

  /**
   * Aktiviert oder pausiert sämtliche Menüeingaben.
   * @param {boolean} enabled - Neuer Aktivierungszustand.
   * @returns {void}
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}
