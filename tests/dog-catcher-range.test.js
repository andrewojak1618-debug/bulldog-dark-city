import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { DOG_CATCHER } from "../js/config/dog-catcher-settings.js";

test("Hundefänger startet und trifft innerhalb derselben Reichweite", () => {
  assert.equal(DOG_CATCHER.attackRange, 130);
  assert.equal(DOG_CATCHER.attackHitRange, DOG_CATCHER.attackRange);
});

test("lokale Reichweitenansicht bleibt DEV- und URL-gesteuert", async () => {
  const source = await readFile(
    new URL(
      "../classes/systems/dog-catcher-range-debug-system.class.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /import\.meta\.env\?\.DEV !== true/);
  assert.match(source, /URLSearchParams/);
  assert.doesNotMatch(source, /console\.(log|debug|info)/);
});
