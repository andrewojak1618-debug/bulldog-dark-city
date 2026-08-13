import assert from "node:assert/strict";
import test from "node:test";
import {
  createTouchControlLayout,
  getTouchLayoutProfile,
  TOUCH_ACTIONS,
  TOUCH_CONTROLS,
} from "../js/config/touch-control-settings.js";

/**
 * Handles map controls.
 * @param {Object[]} controls - The controls value.
 * @returns {Map<string, Object>} The resulting string value.
 */
function mapControls(controls) {
  return new Map(controls.map((control) => [control.action, control]));
}

test("Smartphones und Tablets erhalten getrennte Layoutprofile", () => {
  assert.equal(getTouchLayoutProfile(844, 390), "phone");
  assert.equal(getTouchLayoutProfile(1024, 600), "tablet");
  assert.equal(getTouchLayoutProfile(1366, 1024), "tablet");
});

test("Bewegung und Hauptaktionen bleiben an den äußeren unteren Rändern", () => {
  const controls = mapControls(createTouchControlLayout(
    720,
    480,
    844,
    390,
  ));
  const left = controls.get(TOUCH_ACTIONS.left);
  const right = controls.get(TOUCH_ACTIONS.right);
  const attack = controls.get(TOUCH_ACTIONS.attack);
  const jump = controls.get(TOUCH_ACTIONS.jump);
  assert.ok(left.x < right.x && right.x < 180);
  assert.ok(jump.x > attack.x && attack.x > 520);
  assert.ok(left.y > 400 && jump.y > 400);
});

test("Safe Areas verschieben beide Daumengruppen zuverlässig nach innen", () => {
  const regular = mapControls(createTouchControlLayout(720, 480, 844, 390));
  const safe = mapControls(createTouchControlLayout(
    720,
    480,
    844,
    390,
    { left: 20, right: 16, bottom: 12 },
  ));
  assert.equal(
    safe.get(TOUCH_ACTIONS.left).x - regular.get(TOUCH_ACTIONS.left).x,
    20,
  );
  assert.equal(
    regular.get(TOUCH_ACTIONS.jump).x - safe.get(TOUCH_ACTIONS.jump).x,
    16,
  );
  assert.equal(
    regular.get(TOUCH_ACTIONS.jump).y - safe.get(TOUCH_ACTIONS.jump).y,
    12,
  );
});

test("Alle Smartphone-Touchflächen erreichen mindestens 44 CSS-Pixel", () => {
  const smallestLandscapeScale = 320 / 480;
  const controls = createTouchControlLayout(720, 480, 568, 320);
  controls.forEach((control) => {
    assert.ok(control.size * smallestLandscapeScale >= 44);
  });
});

test("Mobiler Angriffsbutton zeigt die primäre F-Belegung", () => {
  const attack = TOUCH_CONTROLS.controls.find(
    ({ action }) => action === TOUCH_ACTIONS.attack,
  );

  assert.equal(attack.label, "F");
});
