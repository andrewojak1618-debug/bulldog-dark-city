import test from "node:test";
import assert from "node:assert/strict";
import { ThrowBoneInventory } from
  "../classes/systems/throw-bone-inventory.class.js";

test("ThrowBoneInventory sammelt und verbraucht bekannte Knochen", () => {
  const inventory = new ThrowBoneInventory(["normal", "nuclear"]);
  assert.equal(inventory.collect("normal"), true);
  assert.equal(inventory.getCount("normal"), 1);
  assert.equal(inventory.consume("normal"), true);
  assert.equal(inventory.getCount("normal"), 0);
});

test("ThrowBoneInventory verhindert unbekannte und leere Entnahmen", () => {
  const inventory = new ThrowBoneInventory(["normal", "nuclear"]);
  assert.equal(inventory.collect("unknown"), false);
  assert.equal(inventory.consume("nuclear"), false);
});
