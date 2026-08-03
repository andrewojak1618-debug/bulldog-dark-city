import test from "node:test";
import assert from "node:assert/strict";
import { HealthSystem } from "../classes/systems/health-system.class.js";
import { CollectibleSystem } from
  "../classes/systems/collectible-system.class.js";

test("HealthSystem übernimmt und begrenzt Lebenspunkte", () => {
  assert.equal(new HealthSystem(100, 70).getCurrent(), 70);
  assert.equal(new HealthSystem(100, 120).getCurrent(), 100);
  assert.equal(new HealthSystem(100, -10).getCurrent(), 0);
});

test("CollectibleSystem übernimmt nur bekannte Sammelstände", () => {
  const system = new CollectibleSystem(
    ["coins", "serum"],
    { coins: 12, serum: 1, unknown: 99 },
  );

  assert.deepEqual(system.getSnapshot(), { coins: 12, serum: 1 });
});

test("Snapshots verändern den internen Sammelstand nicht", () => {
  const system = new CollectibleSystem(["coins"], { coins: 4 });
  const snapshot = system.getSnapshot();

  snapshot.coins = 50;
  assert.equal(system.getCount("coins"), 4);
});
