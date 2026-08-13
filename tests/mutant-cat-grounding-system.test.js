import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { MutantCatGroundingSystem } from
  "../classes/systems/mutant-cat-grounding-system.class.js";

const MUTANT_CAT_SOURCE = fileURLToPath(new URL(
  "../classes/entities/enemies/mutant-cat.class.js",
  import.meta.url,
));

test("MutantCat importiert das ausgelagerte Grounding-System", async () => {
  const source = await readFile(MUTANT_CAT_SOURCE, "utf8");

  assert.ok(source.includes("import { MutantCatGroundingSystem } from"));
  assert.ok(source.includes(
    '"../../systems/mutant-cat-grounding-system.class.js"',
  ));
  assert.match(
    source,
    /MutantCatGroundingSystem\.applyGeometryKeepingBodyBottom\(/,
  );
});

test("Größenwechsel der Katze bewahrt ihre Physics-Bodenkante", () => {
  const cat = createCatDouble();

  MutantCatGroundingSystem.applyGeometryKeepingBodyBottom(cat, 180, 150);

  assert.equal(cat.body.bottom, 200);
  assert.equal(cat.displayWidth, 180);
  assert.equal(cat.displayHeight, 150);
});

test("Angriffsoffset bewahrt Boden und sichtbare Pfotenkante", () => {
  const cat = createScaledCatDouble();

  MutantCatGroundingSystem.applyGeometryKeepingBodyBottom(cat, 128, 128, 52);

  assert.equal(cat.body.bottom, 200);
  assert.equal(cat.body.offset.y, 52);
  assert.equal(getVisibleAttackBottom(cat), 200);
});

/**
 * Creates cat double.
 * @returns {object} The resulting data object.
 */
function createCatDouble() {
  const cat = {
    y: 100,
    displayWidth: 120,
    displayHeight: 100,
    body: {
      bottom: 200,
      updateFromGameObject() {
        this.bottom = cat.y + cat.displayHeight;
      },
    },
    setDisplaySize(width, height) {
      this.displayWidth = width;
      this.displayHeight = height;
      return this;
    },
  };

  return cat;
}

/**
 * Creates scaled cat double.
 * @returns {object} The resulting data object.
 */
function createScaledCatDouble() {
  const cat = {
    y: 141,
    displayWidth: 128,
    displayHeight: 128,
    body: {
      bottom: 200,
      height: 120,
      offset: { x: 38, y: 126 },
      setOffset(x, y) {
        this.offset = { x, y };
      },
      updateFromGameObject() {
        const scale = cat.displayHeight / 256;
        this.bottom = cat.y + (this.offset.y + this.height - 128) * scale;
      },
    },
    setDisplaySize(width, height) {
      this.displayWidth = width;
      this.displayHeight = height;
      return this;
    },
  };
  return cat;
}

/**
 * Returns visible attack bottom.
 * @param {object} cat - The mutant cat instance.
 * @returns {number} The resulting numeric value.
 */
function getVisibleAttackBottom(cat) {
  const scale = cat.displayHeight / 256;
  return cat.y + (172 - 128) * scale;
}
