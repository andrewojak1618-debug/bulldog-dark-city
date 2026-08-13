import { TOUCH_ACTIONS } from "../../js/config/touch-control-settings.js";

/**
 * Manages input system behavior.
 */
export class InputSystem {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   */
  constructor(scene) {
    this.scene = scene;
    this.initializeState();
    this.createKeyboardInput(scene);
    this.bindJumpKeys();
    this.bindAttackInputs();
  }

  /**
   * Initializes transient input state.
   * @returns {void} No value is returned.
   */
  initializeState() {
    this.jumpQueued = false;
    this.attackQueued = false;
    this.touchState = { left: false, right: false };
    this.touchActions = new Set();
    this.wasMutationPressed = false;
    this.wasGamepadJumpPressed = false;
    this.wasGamepadAttackPressed = false;
  }

  /**
   * Creates the keyboard bindings.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  createKeyboardInput(scene) {
    this.cursors = scene.input.keyboard?.createCursorKeys();
    this.keys = scene.input.keyboard?.addKeys({
      left: "A",
      right: "D",
      jump: "W",
      primaryAttack: "F",
      alternativeAttack: "J",
      mutation: "M",
    });
  }

  /**
   * Binds jump keys.
   * @returns {void} No value is returned.
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
   * Binds attack inputs.
   * @returns {void} No value is returned.
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
   * Checks the touch pointer condition.
   * @param {Phaser.Input.Pointer} pointer - The triggering Phaser pointer.
   * @returns {boolean} Whether the requested condition is met.
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
   * Returns horizontal axis.
   * @returns {-1|0|1} The resulting value.
   */
  getHorizontalAxis() {
    const gamepad = this.scene.input.gamepad?.getPad(0);
    const gamepadAxis = gamepad?.axes[0]?.getValue() ?? 0;
    const leftPressed = this.isDirectionPressed("left", gamepad, gamepadAxis);
    const rightPressed = this.isDirectionPressed("right", gamepad, gamepadAxis);
    if (leftPressed === rightPressed) return 0;
    return leftPressed ? -1 : 1;
  }

  /**
   * Checks whether one horizontal direction is pressed.
   * @param {"left"|"right"} direction - The requested direction.
   * @param {Phaser.Input.Gamepad.Gamepad} gamepad - The active gamepad.
   * @param {number} axis - The horizontal gamepad axis.
   * @returns {boolean} Whether the direction is pressed.
   */
  isDirectionPressed(direction, gamepad, axis) {
    const isLeft = direction === "left";
    const axisPressed = isLeft ? axis < -0.25 : axis > 0.25;
    return Boolean(this.cursors?.[direction].isDown ||
      this.keys?.[direction].isDown || this.touchState[direction] ||
      gamepad?.[direction] || axisPressed);
  }

  /**
   * Consumes jump.
   * @returns {boolean} Whether the requested condition is met.
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
   * Consumes attack.
   * @returns {boolean} Whether the requested condition is met.
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
   * Discards attack.
   */
  discardAttack() {
    this.attackQueued = false;
  }

  /**
   * Consumes mutation.
   * @returns {boolean} Whether the requested condition is met.
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
   * Sets touch action.
   * @param {string} action - The requested action.
   * @param {boolean} isPressed - The is pressed value.
   * @returns {void} No value is returned.
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
   * Consumes touch action.
   * @param {string} action - The requested action.
   * @returns {boolean} Whether the requested condition is met.
   */
  consumeTouchAction(action) {
    const wasQueued = this.touchActions.has(action);
    this.touchActions.delete(action);
    return wasQueued;
  }

  /**
   * Consumes throw.
   * @param {"normal"|"nuclear"} type - The requested item type.
   * @returns {boolean} Whether the requested condition is met.
   */
  consumeThrow(type) {
    const action = type === "normal" ?
      TOUCH_ACTIONS.normalBone : TOUCH_ACTIONS.nuclearBone;
    return this.consumeTouchAction(action);
  }

  /**
   * Clears touch state.
   * @returns {void} No value is returned.
   */
  clearTouchState() {
    this.touchState.left = false;
    this.touchState.right = false;
    this.jumpQueued = false;
    this.attackQueued = false;
    this.touchActions.clear();
  }
}
