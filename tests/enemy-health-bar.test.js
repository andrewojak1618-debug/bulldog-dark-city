import assert from "node:assert/strict";
import test from "node:test";
import { EnemyHealthBar } from
  "../classes/ui/enemy-health-bar.class.js";
import { ENEMY_HEALTH_BAR } from
  "../js/config/enemy-health-bar-settings.js";

/**
 * Creates doubles.
 */
function createDoubles() {
  const graphics = {
    visible: true,
    fillWidths: [],
    setDepth(value) { this.depth = value; return this; },
    setVisible(value) { this.visible = value; return this; },
    setPosition(x, y) { this.position = { x, y }; return this; },
    clear() { return this; },
    fillStyle() { return this; },
    fillRoundedRect(_x, _y, width) {
      this.fillWidths.push(width);
      return this;
    },
    lineStyle() { return this; },
    strokeRoundedRect() { return this; },
    destroy() {},
  };
  const events = { on() {}, once() {}, off() {} };
  const scene = { add: { graphics: () => graphics }, events };
  const target = {
    active: true,
    visible: true,
    displayWidth: 100,
    depth: 12,
    once() {},
    off() {},
    getBounds: () => ({ centerX: 120, top: 200 }),
  };
  return { scene, target, graphics };
}

test("Gegner-Lebensanzeige folgt dem Ziel und sinkt proportional", () => {
  const { scene, target, graphics } = createDoubles();
  let current = 4;
  const bar = new EnemyHealthBar(scene, target, 4, () => current);
  const fullWidth = graphics.fillWidths.at(-1);

  current = 2;
  bar.update();

  assert.deepEqual(graphics.position, {
    x: 120,
    y: 200 + ENEMY_HEALTH_BAR.offsetY,
  });
  assert.equal(
    graphics.depth,
    target.depth + ENEMY_HEALTH_BAR.depthOffset,
  );
  assert.equal(graphics.fillWidths.at(-1), fullWidth / 2);
  assert.equal(graphics.visible, true);
});

test("Leere Gegner-Lebensanzeige verschwindet beim letzten Treffer", () => {
  const { scene, target, graphics } = createDoubles();
  let current = 1;
  const bar = new EnemyHealthBar(scene, target, 1, () => current);

  current = 0;
  bar.update();

  assert.equal(graphics.visible, false);
});
