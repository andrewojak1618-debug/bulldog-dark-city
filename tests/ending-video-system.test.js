import assert from "node:assert/strict";
import test from "node:test";
import { EndingVideoSystem } from
  "../classes/systems/ending-video-system.class.js";

test("Abschlussvideo startet genau einmal ohne Loop", () => {
  const calls = [];
  const scene = {
    video: { play: (loop) => calls.push(loop) },
    showFallback: () => calls.push("fallback"),
  };

  EndingVideoSystem.start(scene);

  assert.deepEqual(calls, [false]);
});

test("Synchroner Videofehler aktiviert den sicheren Fallback", () => {
  let fallbackCalls = 0;
  const scene = {
    video: { play: () => { throw new Error("blocked"); } },
    showFallback: () => { fallbackCalls += 1; },
  };

  EndingVideoSystem.start(scene);

  assert.equal(fallbackCalls, 1);
});

test("Videoframe wird nur einmal auf das Canvas skaliert", () => {
  const calls = [];
  const video = {
    setDisplaySize: (width, height) => {
      calls.push([width, height]);
      return video;
    },
    setAlpha: (alpha) => {
      calls.push(alpha);
      return video;
    },
  };
  const scene = {
    isVideoSized: false,
    scale: { width: 720, height: 480 },
    video,
  };

  EndingVideoSystem.sizeAndReveal(scene);
  EndingVideoSystem.sizeAndReveal(scene);

  assert.deepEqual(calls, [[720, 480], 1]);
});
