import assert from "node:assert/strict";
import test from "node:test";
import { RobotCatAttackSystem } from
  "../classes/systems/robot-cat-attack-system.class.js";
import { RobotCatAudioSystem } from
  "../classes/systems/robot-cat-audio-system.class.js";
import { ROBOT_CAT_AUDIO } from
  "../js/config/robot-cat-audio-settings.js";
import {
  ROBOT_CAT_ATTACK,
  ROBOT_CAT_ATTACK_TEXTURE,
  ROBOT_CAT_CLAWS_TEXTURE,
} from "../js/config/robot-cat-settings.js";

/**
 * Creates target.
 */
function createTarget(options = {}) {
  return {
    active: true,
    x: options.x ?? 400,
    y: options.y ?? 400,
    isHit: options.isHit ?? false,
    isKnockedOut: false,
    isMutating: options.isMutating ?? false,
    isMutated: options.isMutated ?? false,
    body: {
      enable: true,
      x: options.x ?? 400,
      y: options.bodyY ?? 320,
      width: 104,
      height: 64,
      center: {
        x: options.x ?? 400,
        y: options.centerY ?? 352,
      },
    },
  };
}

test("Klauenangriff nutzt 400 Pixel Reichweite und Bulldog-Größe", () => {
  assert.equal(ROBOT_CAT_ATTACK.projectileDistance, 400);
  assert.equal(ROBOT_CAT_ATTACK.projectileDisplaySize, 128);
  assert.equal(ROBOT_CAT_ATTACK_TEXTURE.frameCount, 4);
  assert.equal(ROBOT_CAT_CLAWS_TEXTURE.frameCount, 3);
});

test("Klauensound wird mit zentraler Lautstärke genau einmal gestartet", () => {
  const calls = [];
  const scene = {
    sound: {
      play: (...parameters) => calls.push(parameters),
    },
  };

  RobotCatAudioSystem.playClawAttack(scene);

  assert.deepEqual(calls, [[
    ROBOT_CAT_AUDIO.clawAttack.key,
    { volume: ROBOT_CAT_AUDIO.clawAttack.volume },
  ]]);
  assert.match(ROBOT_CAT_AUDIO.clawAttack.path, /claw-attack\.ogg$/);
});

test("Flugsound folgt genau einer Flugsequenz und wird sauber beendet", () => {
  const data = new Map();
  const calls = {
    add: [],
    play: 0,
    stop: 0,
    destroy: 0,
    tweenStop: 0,
  };
  let tweenConfig = null;
  const sound = {
    once: () => sound,
    play: () => {
      calls.play += 1;
    },
    stop: () => {
      calls.stop += 1;
    },
    destroy: () => {
      calls.destroy += 1;
    },
  };
  const robotCat = {
    scene: {
      sound: {
        add: (...parameters) => {
          calls.add.push(parameters);
          return sound;
        },
      },
      tweens: {
        add: (config) => {
          tweenConfig = config;
          return {
            stop: () => {
              calls.tweenStop += 1;
            },
          };
        },
      },
    },
    getData: (key) => data.get(key),
    setData: (key, value) => data.set(key, value),
  };

  RobotCatAudioSystem.playThrustFlight(robotCat);
  RobotCatAudioSystem.fadeOutThrustFlight(robotCat, 160);
  RobotCatAudioSystem.stopThrustFlight(robotCat);

  assert.deepEqual(calls.add, [[
    ROBOT_CAT_AUDIO.thrustFlight.key,
    { volume: ROBOT_CAT_AUDIO.thrustFlight.volume },
  ]]);
  assert.equal(calls.play, 1);
  assert.equal(calls.stop, 1);
  assert.equal(calls.destroy, 1);
  assert.equal(calls.tweenStop, 1);
  assert.equal(tweenConfig.targets, sound);
  assert.equal(tweenConfig.volume, 0);
  assert.equal(tweenConfig.duration, 160);
  assert.equal(data.get("thrustFlightSound"), null);
  assert.match(ROBOT_CAT_AUDIO.thrustFlight.path, /thrust-flight\.ogg$/);
});

test("Roboterkatze erkennt Ziele innerhalb der Projektilreichweite", () => {
  const robotCat = { active: true, x: 0, y: 400 };

  assert.equal(
    RobotCatAttackSystem.isTargetInRange(robotCat, createTarget({ x: 400 })),
    true,
  );
  assert.equal(
    RobotCatAttackSystem.isTargetInRange(robotCat, createTarget({ x: 401 })),
    false,
  );
});

test("Klauenflug wird als normierter Vektor zur Bulldogge berechnet", () => {
  const direction = RobotCatAttackSystem.getAimVector(
    0,
    0,
    createTarget({ x: 300, centerY: 400 }),
    1,
  );

  assert.ok(Math.abs(Math.hypot(direction.x, direction.y) - 1) < 0.000_001);
  assert.ok(direction.x > 0);
  assert.ok(direction.y > 0);
});

test("Ein Klauentreffer zieht genau zehn Lebenspunkte ab", () => {
  const system = Object.create(RobotCatAttackSystem.prototype);
  const target = createTarget();
  let receivedDamage = 0;
  let hitAt = null;
  target.takeHit = (time) => {
    hitAt = time;
  };
  target.knockOut = () => {
    throw new Error("Der Testtreffer darf nicht K. o. setzen.");
  };
  system.player = target;
  system.health = {
    takeDamage: (amount) => {
      receivedDamage = amount;
      return 90;
    },
  };

  system.resolvePlayerHit(1_234);

  assert.equal(receivedDamage, 10);
  assert.equal(hitAt, 1_234);
});

test("Mutierte Bulldogge nimmt durch den Klauenangriff keinen Schaden", () => {
  const system = Object.create(RobotCatAttackSystem.prototype);
  const target = createTarget({ isMutated: true });
  let receivedDamage = 0;
  let hitReactionStarted = false;
  target.takeHit = () => {
    hitReactionStarted = true;
  };
  target.knockOut = () => {
    throw new Error("Ein immunes Ziel darf nicht K. o. gehen.");
  };
  system.player = target;
  system.health = {
    takeDamage: (amount) => {
      receivedDamage += amount;
      return 90;
    },
  };

  system.resolvePlayerHit(1_234);

  assert.equal(receivedDamage, 0);
  assert.equal(hitReactionStarted, false);
});
