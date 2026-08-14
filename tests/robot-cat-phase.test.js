import assert from "node:assert/strict";
import test from "node:test";
import { HealthSystem } from
  "../classes/systems/health-system.class.js";
import { RobotCatPhaseSystem } from
  "../classes/systems/robot-cat-phase-system.class.js";
import { RobotCatAttackSystem } from
  "../classes/systems/robot-cat-attack-system.class.js";
import { RobotCatRocketSystem } from
  "../classes/systems/robot-cat-rocket-system.class.js";
import {
  ROBOT_CAT_PHASES,
  ROBOT_CAT_ROCKET_ATTACK,
  ROBOT_CAT_ROCKET_EXPLOSION_TEXTURE,
  ROBOT_CAT_ROCKET_TEXTURE,
  ROBOT_CAT_SHOOT_TEXTURE,
} from "../js/config/robot-cat-settings.js";

/**
 * Creates a small data-capable boss double.
 * @returns {object} The created boss double.
 */
function createRobotCat() {
  const data = new Map();
  return {
    getData: (key) => data.get(key),
    setData: (key, value) => data.set(key, value),
    once: () => undefined,
  };
}

test("boss phases follow the red, orange, and blue health groups", () => {
  assert.equal(RobotCatPhaseSystem.getPhase(9, 9), 0);
  assert.equal(RobotCatPhaseSystem.getPhase(7, 9), 0);
  assert.equal(RobotCatPhaseSystem.getPhase(6, 9), 1);
  assert.equal(RobotCatPhaseSystem.getPhase(4, 9), 1);
  assert.equal(RobotCatPhaseSystem.getPhase(3, 9), 2);
  assert.equal(RobotCatPhaseSystem.getPhase(1, 9), 2);
});

test("each color change unlocks a prioritized stronger phase", () => {
  const robotCat = createRobotCat();
  const health = new HealthSystem(9);
  RobotCatPhaseSystem.attach(robotCat, health);
  health.takeDamage(3);

  assert.equal(robotCat.getData("combatPhase"), 1);
  assert.equal(robotCat.getData("phaseAttackPending"), true);
  assert.equal(robotCat.getData("speedMultiplier"), 1.2);

  robotCat.setData("phaseAttackPending", false);
  health.takeDamage(3);
  assert.equal(robotCat.getData("combatPhase"), 2);
  assert.equal(robotCat.getData("phaseAttackPending"), true);
  assert.equal(robotCat.getData("speedMultiplier"), 1.4);
});

test("rocket barrage uses four homing shots and processed animations", () => {
  assert.equal(ROBOT_CAT_ROCKET_ATTACK.shotCount, 4);
  assert.equal(ROBOT_CAT_SHOOT_TEXTURE.frameCount, 4);
  assert.equal(ROBOT_CAT_ROCKET_TEXTURE.frameCount, 4);
  assert.equal(ROBOT_CAT_ROCKET_EXPLOSION_TEXTURE.startFrame, 1);
  assert.match(ROBOT_CAT_SHOOT_TEXTURE.path, /shoot\/side\/spritesheet\.png$/);
});

test("blue phase turns and flies faster than the orange phase", () => {
  const orangeBoss = createRobotCat();
  const blueBoss = createRobotCat();
  orangeBoss.setData("combatPhase", 1);
  blueBoss.setData("combatPhase", 2);
  const orange = RobotCatPhaseSystem.getSettings(orangeBoss);
  const blue = RobotCatPhaseSystem.getSettings(blueBoss);

  assert.equal(orange.rocketEnabled, true);
  assert.ok(blue.attackCooldownMs < orange.attackCooldownMs);
  assert.ok(blue.attackDamage > orange.attackDamage);
  assert.ok(blue.rocketSpeedMultiplier > orange.rocketSpeedMultiplier);
  assert.equal(ROBOT_CAT_PHASES.length, 3);
});

test("homing rotation follows the shortest limited direction", () => {
  const turn = RobotCatRocketSystem.rotateTowards(0, Math.PI, 0.25);
  const wrapped = RobotCatRocketSystem.rotateTowards(3.1, -3.1, 0.1);

  assert.equal(Math.abs(turn), 0.25);
  assert.ok(wrapped > 3.1);
});

test("shooting pose holds while exactly four rockets are scheduled", () => {
  const system = Object.create(RobotCatAttackSystem.prototype);
  const robotCat = createRobotCat();
  const delays = [];
  const callbacks = [];
  let rocketCount = 0;
  robotCat.x = 500;
  robotCat.setFlipX = () => robotCat;
  robotCat.setDisplaySize = () => robotCat;
  robotCat.play = (key) => {
    robotCat.animationKey = key;
    return robotCat;
  };
  system.robotCat = robotCat;
  system.player = { x: 300 };
  system.rocketEvents = [];
  system.rocketSystem = { fire: () => rocketCount += 1 };
  system.scene = { time: { delayedCall: (delay, callback) => {
    delays.push(delay);
    callbacks.push(callback);
    return { remove: () => undefined };
  } } };

  system.startRocketAttack();
  callbacks.slice(0, 4).forEach((callback) => callback());

  assert.equal(robotCat.animationKey, ROBOT_CAT_SHOOT_TEXTURE.animationKey);
  assert.equal(robotCat.getData("isAttacking"), true);
  assert.equal(rocketCount, 4);
  assert.deepEqual(delays, [600, 900, 1_200, 1_500, 1_900]);
});
