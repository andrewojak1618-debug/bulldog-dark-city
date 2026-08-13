import assert from "node:assert/strict";
import test from "node:test";
import { RobotCatCombatSystem } from
  "../classes/systems/robot-cat-combat-system.class.js";
import { ROBOT_CAT_STATES } from "../js/config/robot-cat-settings.js";

/**
 * Creates robot cat.
 */
function createRobotCat(movementState) {
  return {
    getData: (key) => key === "movementState" ? movementState : null,
  };
}

test("normale Bulldogge trifft die Roboterkatze nur am Boden", () => {
  const player = { isMutated: false };

  assert.equal(
    RobotCatCombatSystem.canReceiveMeleeAttack(
      createRobotCat(ROBOT_CAT_STATES.walking),
      player,
    ),
    true,
  );
  [
    ROBOT_CAT_STATES.takingOff,
    ROBOT_CAT_STATES.flying,
    ROBOT_CAT_STATES.landing,
  ].forEach((state) => {
    assert.equal(
      RobotCatCombatSystem.canReceiveMeleeAttack(createRobotCat(state), player),
      false,
    );
  });
});

test("mutierte Bulldogge darf die Roboterkatze in der Luft treffen", () => {
  const player = { isMutated: true };

  assert.equal(
    RobotCatCombatSystem.canReceiveMeleeAttack(
      createRobotCat(ROBOT_CAT_STATES.flying),
      player,
    ),
    true,
  );
});
