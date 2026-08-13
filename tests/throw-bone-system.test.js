import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const THROW_BONE_SYSTEM_PATH = new URL(
  "../classes/systems/throw-bone-system.class.js",
  import.meta.url,
);

test("throw forwards the selected bone type to the projectile", async () => {
  const source = await readFile(THROW_BONE_SYSTEM_PATH, "utf8");

  assert.match(
    source,
    /createProjectile\(type,\s*settings,\s*direction\)/,
  );
  assert.match(source, /boneType:\s*type/);
});
