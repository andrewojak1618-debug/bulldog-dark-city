import assert from "node:assert/strict";
import test from "node:test";
import { RobotCatSystem } from
  "../classes/systems/robot-cat-system.class.js";
import { ROBOT_CAT } from "../js/config/robot-cat-settings.js";

/** Erstellt eine minimale Roboterkatze für die Hinderniserkennung. */
function createRobotCat(options = {}) {
  const data = new Map([
    ["groundY", options.groundY ?? 400],
    ["lastObstacleId", options.lastObstacleId ?? null],
    ["lastObstacleX", options.lastObstacleX ?? null],
  ]);
  return {
    x: options.x ?? 1_000,
    getData: (key) => data.get(key),
    setData: (key, value) => data.set(key, value),
  };
}

/** Erstellt eine minimale Bulldogge mit steuerbarer Fußposition. */
function createPlayer(options = {}) {
  return {
    x: options.x ?? 920,
    active: options.active ?? true,
    isKnockedOut: options.isKnockedOut ?? false,
    body: {
      enable: options.bodyEnabled ?? true,
      bottom: options.bottom ?? 400,
    },
  };
}

test("Roboterkatze erkennt die Bulldogge vor sich als Hindernis", () => {
  const robotCat = createRobotCat();
  const player = createPlayer();

  assert.deepEqual(
    RobotCatSystem.findObstacleAhead(robotCat, -1, player),
    { id: ROBOT_CAT.playerObstacleId, x: player.x },
  );
});

test("Bulldogge wird zwanzig Prozent früher als eine Box erkannt", () => {
  const robotCat = createRobotCat({ x: 1_000 });
  const player = createPlayer({ x: 875 });

  assert.deepEqual(
    RobotCatSystem.findObstacleAhead(robotCat, -1, player),
    { id: ROBOT_CAT.playerObstacleId, x: player.x },
  );
});

test("Roboterkatze ignoriert eine Bulldogge oberhalb der Laufebene", () => {
  const robotCat = createRobotCat();
  const airbornePlayer = createPlayer({ bottom: 300 });

  assert.equal(
    RobotCatSystem.findObstacleAhead(robotCat, -1, airbornePlayer),
    null,
  );
});

test("Dasselbe Spielerhindernis löst keinen direkten zweiten Flug aus", () => {
  const robotCat = createRobotCat({
    lastObstacleId: ROBOT_CAT.playerObstacleId,
    lastObstacleX: 920,
  });
  const player = createPlayer();

  assert.equal(
    RobotCatSystem.findObstacleAhead(robotCat, -1, player),
    null,
  );
});

test("Statische Boxen bleiben weiterhin Flugauslöser", () => {
  const robotCat = createRobotCat({ x: 600 });
  const airbornePlayer = createPlayer({ x: 550, bottom: 300 });

  assert.deepEqual(
    RobotCatSystem.findObstacleAhead(robotCat, -1, airbornePlayer),
    { id: "box-0", x: 500 },
  );
});

test("Passierte Hindernisse werden nach sicherem Abstand freigegeben", () => {
  const robotCat = createRobotCat({
    x: 1_000,
    lastObstacleId: ROBOT_CAT.playerObstacleId,
    lastObstacleX: 700,
  });

  RobotCatSystem.resetPassedObstacle(robotCat);

  assert.equal(robotCat.getData("lastObstacleId"), null);
  assert.equal(robotCat.getData("lastObstacleX"), null);
});
