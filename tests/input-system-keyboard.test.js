import assert from "node:assert/strict";
import test from "node:test";
import { InputSystem } from "../classes/input/input-system.class.js";

/**
 * Creates input fixture.
 * @returns {{scene: object, keys: object, keyboardHandlers: Map, pointerHandlers: Map, gamepad: object}} The resulting collection.
 */
function createInputFixture() {
  const keyboardHandlers = new Map();
  const pointerHandlers = new Map();
  const keys = {
    left: { isDown: false },
    right: { isDown: false },
    jump: { isDown: false },
    primaryAttack: { isDown: false },
    alternativeAttack: { isDown: false },
    mutation: { isDown: false },
  };
  const gamepad = {
    axes: [{ getValue: () => 0 }],
    buttons: Array.from({ length: 3 }, () => ({ pressed: false })),
  };
  const scene = {
    input: {
      keyboard: {
        createCursorKeys: () => ({
          left: { isDown: false },
          right: { isDown: false },
        }),
        addKeys: (bindings) => {
          assert.deepEqual(bindings, {
            left: "A",
            right: "D",
            jump: "W",
            primaryAttack: "F",
            alternativeAttack: "J",
            mutation: "M",
          });
          return keys;
        },
        on: (event, handler) => keyboardHandlers.set(event, handler),
        off: () => {},
      },
      gamepad: { getPad: () => gamepad },
      on: (event, handler) => pointerHandlers.set(event, handler),
      off: () => {},
    },
    events: { once: () => {} },
  };
  return { scene, keys, keyboardHandlers, pointerHandlers, gamepad };
}

test("F und J lösen jeweils genau einen Angriff pro Tastendruck aus", () => {
  const fixture = createInputFixture();
  const input = new InputSystem(fixture.scene);

  fixture.keyboardHandlers.get("keydown-F")({ repeat: false });
  assert.equal(input.consumeAttack(), true);
  assert.equal(input.consumeAttack(), false);
  fixture.keyboardHandlers.get("keydown-J")({ repeat: false });
  assert.equal(input.consumeAttack(), true);
});

test("gehaltene Angriffstasten erzeugen keine Mehrfachauslösung", () => {
  const fixture = createInputFixture();
  const input = new InputSystem(fixture.scene);

  fixture.keyboardHandlers.get("keydown-F")({ repeat: true });
  fixture.keyboardHandlers.get("keydown-J")({ repeat: true });
  assert.equal(input.consumeAttack(), false);
});

test("M löst Mutation flankengesteuert und ohne Angriff aus", () => {
  const fixture = createInputFixture();
  const input = new InputSystem(fixture.scene);

  fixture.keys.mutation.isDown = true;
  assert.equal(input.consumeMutation(), true);
  assert.equal(input.consumeMutation(), false);
  assert.equal(input.consumeAttack(), false);
  fixture.keys.mutation.isDown = false;
  assert.equal(input.consumeMutation(), false);
  fixture.keys.mutation.isDown = true;
  assert.equal(input.consumeMutation(), true);
});

test("Linksklick und Gamepad-X bleiben einzeln auslösbar", () => {
  const fixture = createInputFixture();
  const input = new InputSystem(fixture.scene);

  fixture.pointerHandlers.get("pointerdown")({ button: 0, wasTouch: false });
  assert.equal(input.consumeAttack(), true);
  fixture.gamepad.buttons[2].pressed = true;
  assert.equal(input.consumeAttack(), true);
  assert.equal(input.consumeAttack(), false);
  fixture.gamepad.buttons[2].pressed = false;
  assert.equal(input.consumeAttack(), false);
  fixture.gamepad.buttons[2].pressed = true;
  assert.equal(input.consumeAttack(), true);
});
