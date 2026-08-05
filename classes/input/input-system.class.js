/**
 * Bündelt Tastatur- und vorbereitete Gamepad-Eingaben des Spielers.
 */
export class InputSystem {
  /**
   * Registriert die Steuerung einer Spielszene.
   * @param {Phaser.Scene} scene - Szene, die Eingaben empfängt.
   */
  constructor(scene) {
    this.scene = scene;
    this.jumpQueued = false;
    this.attackQueued = false;
    this.wasMutationComboPressed = false;
    this.cursors = scene.input.keyboard?.createCursorKeys();
    this.keys = scene.input.keyboard?.addKeys({
      left: "A",
      right: "D",
      jump: "W",
      attack: "J",
      mutation: "F",
    });
    this.wasGamepadJumpPressed = false;
    this.wasGamepadAttackPressed = false;
    this.bindJumpKeys();
    this.bindAttackInputs();
  }

  /**
   * Puffert kurze Sprungeingaben bis zum nächsten Spiel-Update.
   * @returns {void}
   */
  bindJumpKeys() {
    const keyboard = this.scene.input.keyboard;

    if (!keyboard) return;
    this.queueJump = (event) => {
      if (!event.repeat) this.jumpQueued = true;
    };
    keyboard.on("keydown-UP", this.queueJump);
    keyboard.on("keydown-SPACE", this.queueJump);
    keyboard.on("keydown-W", this.queueJump);
    this.scene.events.once("shutdown", () => {
      keyboard.off("keydown-UP", this.queueJump);
      keyboard.off("keydown-SPACE", this.queueJump);
      keyboard.off("keydown-W", this.queueJump);
    });
  }

  /**
   * Puffert Bissangriffe von Tastatur und linker Maustaste.
   * @returns {void}
   */
  bindAttackInputs() {
    const keyboard = this.scene.input.keyboard;

    this.queueKeyboardAttack = (event) => {
      if (!event.repeat) this.attackQueued = true;
    };
    this.queuePointerAttack = (pointer) => {
      if (pointer.button === 0) this.attackQueued = true;
    };
    keyboard?.on("keydown-J", this.queueKeyboardAttack);
    this.scene.input.on("pointerdown", this.queuePointerAttack);
    this.scene.events.once("shutdown", () => {
      keyboard?.off("keydown-J", this.queueKeyboardAttack);
      this.scene.input.off("pointerdown", this.queuePointerAttack);
    });
  }

  /**
   * Ermittelt die horizontale Bewegungsrichtung.
   * @returns {-1|0|1} Linke, neutrale oder rechte Richtung.
   */
  getHorizontalAxis() {
    const gamepad = this.scene.input.gamepad?.getPad(0);
    const gamepadAxis = gamepad?.axes[0]?.getValue() ?? 0;
    const leftPressed =
      this.cursors?.left.isDown ||
      this.keys?.left.isDown ||
      gamepad?.left ||
      gamepadAxis < -0.25;
    const rightPressed =
      this.cursors?.right.isDown ||
      this.keys?.right.isDown ||
      gamepad?.right ||
      gamepadAxis > 0.25;

    if (leftPressed === rightPressed) return 0;
    return leftPressed ? -1 : 1;
  }

  /**
   * Meldet einen neuen Sprungimpuls genau einmal pro Betätigung.
   * @returns {boolean} `true` bei einem neuen Tastatur- oder Gamepadimpuls.
   */
  consumeJump() {
    const gamepad = this.scene.input.gamepad?.getPad(0);
    const gamepadJumpPressed = Boolean(gamepad?.buttons[0]?.pressed);
    const newGamepadJump = gamepadJumpPressed && !this.wasGamepadJumpPressed;
    this.wasGamepadJumpPressed = gamepadJumpPressed;
    const shouldJump = this.jumpQueued || newGamepadJump;
    this.jumpQueued = false;
    return shouldJump;
  }

  /**
   * Meldet einen neuen Bissimpuls von J, Linksklick oder Gamepad-X genau
   * einmal pro Betätigung.
   * @returns {boolean} `true`, wenn ein neuer Angriff angefordert wurde.
   */
  consumeAttack() {
    const gamepad = this.scene.input.gamepad?.getPad(0);
    const gamepadAttackPressed = Boolean(gamepad?.buttons[2]?.pressed);
    const newGamepadAttack =
      gamepadAttackPressed && !this.wasGamepadAttackPressed;
    this.wasGamepadAttackPressed = gamepadAttackPressed;
    const shouldAttack = this.attackQueued || newGamepadAttack;
    this.attackQueued = false;
    return shouldAttack;
  }

  /**
   * Meldet die neue Tastenkombination J und F genau einmal pro Betätigung.
   * Eine durch J gepufferte Bissattacke wird dabei verworfen.
   * @returns {boolean} `true`, wenn beide Mutationstasten neu gedrückt sind.
   */
  consumeMutation() {
    const comboPressed = Boolean(
      this.keys?.attack?.isDown && this.keys?.mutation?.isDown,
    );
    const newCombo = comboPressed && !this.wasMutationComboPressed;
    this.wasMutationComboPressed = comboPressed;
    if (newCombo) this.attackQueued = false;
    return newCombo;
  }
}
