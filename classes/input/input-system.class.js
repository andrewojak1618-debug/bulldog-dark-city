import { TOUCH_ACTIONS } from "../../js/config/touch-control-settings.js";

/**
 * Bündelt Tastatur-, Maus-, Touch- und Gamepad-Eingaben des Spielers.
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
    this.touchState = { left: false, right: false };
    this.touchActions = new Set();
    this.wasMutationPressed = false;
    this.cursors = scene.input.keyboard?.createCursorKeys();
    this.keys = scene.input.keyboard?.addKeys({
      left: "A",
      right: "D",
      jump: "W",
      primaryAttack: "F",
      alternativeAttack: "J",
      mutation: "M",
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
   * Puffert Angriffe von beiden Tastaturbelegungen und linker Maustaste.
   * @returns {void}
   */
  bindAttackInputs() {
    const keyboard = this.scene.input.keyboard;

    this.queueKeyboardAttack = (event) => {
      if (!event.repeat) this.attackQueued = true;
    };
    this.queuePointerAttack = (pointer) => {
      if (!this.isTouchPointer(pointer) && pointer.button === 0) {
        this.attackQueued = true;
      }
    };
    keyboard?.on("keydown-F", this.queueKeyboardAttack);
    keyboard?.on("keydown-J", this.queueKeyboardAttack);
    this.scene.input.on("pointerdown", this.queuePointerAttack);
    this.scene.events.once("shutdown", () => {
      keyboard?.off("keydown-F", this.queueKeyboardAttack);
      keyboard?.off("keydown-J", this.queueKeyboardAttack);
      this.scene.input.off("pointerdown", this.queuePointerAttack);
    });
  }

  /**
   * Erkennt Phaser- und Browserkennzeichnungen einer Touchberührung.
   * @param {Phaser.Input.Pointer} pointer - Auslösender Phaser-Pointer.
   * @returns {boolean} Ob die Eingabe von einem Touchscreen stammt.
   */
  isTouchPointer(pointer) {
    const nativeType = pointer.event?.pointerType;
    const eventType = pointer.event?.type ?? "";
    return Boolean(
      pointer.wasTouch ||
      pointer.pointerType === "touch" ||
      nativeType === "touch" ||
      eventType.startsWith("touch"),
    );
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
      this.touchState.left ||
      gamepad?.left ||
      gamepadAxis < -0.25;
    const rightPressed =
      this.cursors?.right.isDown ||
      this.keys?.right.isDown ||
      this.touchState.right ||
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
   * Meldet einen neuen Angriffsimpuls von F, J, Linksklick oder Gamepad-X
   * genau einmal pro Betätigung.
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

  /** Verwirft einen gepufferten Tastatur-, Maus- oder Touchangriff. */
  discardAttack() {
    this.attackQueued = false;
  }

  /**
   * Meldet M oder den mobilen Mutationsbutton genau einmal pro Betätigung.
   * @returns {boolean} `true`, wenn die Mutation neu angefordert wurde.
   */
  consumeMutation() {
    const mutationPressed = Boolean(this.keys?.mutation?.isDown);
    const newKeyboardMutation =
      mutationPressed && !this.wasMutationPressed;
    const touchMutation = this.consumeTouchAction(TOUCH_ACTIONS.mutation);
    this.wasMutationPressed = mutationPressed;
    return newKeyboardMutation || touchMutation;
  }

  /**
   * Übernimmt den Zustand eines mobilen Steuerelements.
   * @param {string} action - Aktion aus `TOUCH_ACTIONS`.
   * @param {boolean} isPressed - Ob der Button gerade gehalten wird.
   * @returns {void}
   */
  setTouchAction(action, isPressed) {
    if (action === TOUCH_ACTIONS.left || action === TOUCH_ACTIONS.right) {
      this.touchState[action] = isPressed;
      return;
    }
    if (!isPressed) return;
    if (action === TOUCH_ACTIONS.jump) this.jumpQueued = true;
    else if (action === TOUCH_ACTIONS.attack) this.attackQueued = true;
    else this.touchActions.add(action);
  }

  /**
   * Meldet eine gepufferte Touchaktion genau einmal.
   * @param {string} action - Zu prüfende Touchaktion.
   * @returns {boolean} Ob die Aktion seit dem letzten Abruf ausgelöst wurde.
   */
  consumeTouchAction(action) {
    const wasQueued = this.touchActions.has(action);
    this.touchActions.delete(action);
    return wasQueued;
  }

  /**
   * Meldet eine mobile Wurfaktion genau einmal.
   * @param {"normal"|"nuclear"} type - Gewählte Knochenart.
   * @returns {boolean} Ob der passende Touchbutton gedrückt wurde.
   */
  consumeThrow(type) {
    const action = type === "normal" ?
      TOUCH_ACTIONS.normalBone : TOUCH_ACTIONS.nuclearBone;
    return this.consumeTouchAction(action);
  }

  /**
   * Beendet gehaltene Touchbewegungen und verwirft gepufferte Aktionen.
   * @returns {void}
   */
  clearTouchState() {
    this.touchState.left = false;
    this.touchState.right = false;
    this.jumpQueued = false;
    this.attackQueued = false;
    this.touchActions.clear();
  }
}
