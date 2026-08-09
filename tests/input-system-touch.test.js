import assert from "node:assert/strict";
import test from "node:test";
import { InputSystem } from "../classes/input/input-system.class.js";
import { TOUCH_ACTIONS } from
  "../js/config/touch-control-settings.js";

/**
 * Erstellt die für InputSystem erforderlichen Phaser-Schnittstellen als Stubs.
 * @returns {object} Minimale testbare Szene.
 */
function createSceneStub() {
  const cursors = { left: { isDown: false }, right: { isDown: false } };
  const keys = {
    left: { isDown: false },
    right: { isDown: false },
    jump: { isDown: false },
    attack: { isDown: false },
    mutation: { isDown: false },
  };
  return {
    input: {
      keyboard: {
        createCursorKeys: () => cursors,
        addKeys: () => keys,
        on: () => {},
        off: () => {},
      },
      gamepad: { getPad: () => null },
      on: () => {},
      off: () => {},
    },
    events: { once: () => {} },
  };
}

test("Touchbewegung wird gehalten und beim Loslassen beendet", () => {
  const input = new InputSystem(createSceneStub());
  input.setTouchAction(TOUCH_ACTIONS.left, true);
  assert.equal(input.getHorizontalAxis(), -1);
  input.setTouchAction(TOUCH_ACTIONS.right, true);
  assert.equal(input.getHorizontalAxis(), 0);
  input.clearTouchState();
  assert.equal(input.getHorizontalAxis(), 0);
});

test("Touchaktionen werden nur einmal verbraucht", () => {
  const input = new InputSystem(createSceneStub());
  input.setTouchAction(TOUCH_ACTIONS.jump, true);
  input.setTouchAction(TOUCH_ACTIONS.attack, true);
  input.setTouchAction(TOUCH_ACTIONS.mutation, true);
  assert.equal(input.consumeJump(), true);
  assert.equal(input.consumeJump(), false);
  assert.equal(input.consumeAttack(), true);
  assert.equal(input.consumeAttack(), false);
  assert.equal(input.consumeMutation(), true);
  assert.equal(input.consumeMutation(), false);
});

test("Beide Wurfknochen besitzen getrennte Touchpuffer", () => {
  const input = new InputSystem(createSceneStub());
  input.setTouchAction(TOUCH_ACTIONS.normalBone, true);
  input.setTouchAction(TOUCH_ACTIONS.nuclearBone, true);
  assert.equal(input.consumeThrow("normal"), true);
  assert.equal(input.consumeThrow("normal"), false);
  assert.equal(input.consumeThrow("nuclear"), true);
  assert.equal(input.consumeThrow("nuclear"), false);
});

test("Touchberührungen lösen keine globale Mausattacke aus", () => {
  const scene = createSceneStub();
  let pointerHandler;
  scene.input.on = (_event, handler) => { pointerHandler = handler; };
  const input = new InputSystem(scene);
  pointerHandler({ wasTouch: true, button: 0 });
  assert.equal(input.consumeAttack(), false);
  pointerHandler({
    wasTouch: false,
    event: { pointerType: "mouse", type: "pointerdown" },
    button: 0,
  });
  assert.equal(input.consumeAttack(), true);
});
