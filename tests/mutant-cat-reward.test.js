import assert from "node:assert/strict";
import test from "node:test";
import { isFastMutantCatDefeat } from
  "../js/config/mutant-cat-reward-settings.js";

test("Golden Coin gilt bis einschließlich 15 Sekunden", () => {
  assert.equal(isFastMutantCatDefeat(0), true);
  assert.equal(isFastMutantCatDefeat(15_000), true);
  assert.equal(isFastMutantCatDefeat(15_001), false);
});
