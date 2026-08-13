import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { TEST_LEVEL } from "../js/config/test-level-settings.js";

const README = readFileSync(
  new URL("../README.md", import.meta.url),
  "utf8",
);

test("Levelhinweis nennt F primär, J optional und M für Mutation", () => {
  const hint = TEST_LEVEL.movementInfoPopup.text;

  assert.match(hint, /F · Biss/);
  assert.match(hint, /J optional/);
  assert.match(hint, /M · Mutation/);
});

test("README dokumentiert F, J und M mit eindeutigen Rollen", () => {
  assert.match(README, /`F` oder linke Maustaste: Angreifen/);
  assert.match(README, /`J`: optionale Alternativtaste für den Angriff/);
  assert.match(README, /`M`: Mutation bei voller Serumleiste/);
  assert.doesNotMatch(README, /`F`, `J` oder linke Maustaste/);
});
