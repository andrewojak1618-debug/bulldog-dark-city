import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { IntroVideoLifecycleController } from
  "../classes/core/controllers/intro-video-lifecycle-controller.class.js";

/**
 * Creates timer.
 */
function createTimer(callback) {
  return {
    callback,
    removed: false,
    remove() {
      this.removed = true;
    },
  };
}

/**
 * Creates harness.
 */
function createHarness() {
  const timers = [];
  const video = new EventEmitter();
  video.playCount = 0;
  video.stopCount = 0;
  video.video = {
    currentTime: 0,
    paused: false,
    ended: false,
  };
  video.play = () => { video.playCount += 1; };
  video.stop = () => { video.stopCount += 1; };
  const calls = { active: [], inactive: 0, finish: 0 };
  const scene = {
    time: {
      delayedCall: (_delay, callback) => {
        const timer = createTimer(callback);
        timers.push(timer);
        return timer;
      },
    },
  };
  const controller = new IntroVideoLifecycleController(scene, video, {
    onActive: (isFirstFrame) => calls.active.push(isFirstFrame),
    onInactive: () => { calls.inactive += 1; },
    onFinish: () => { calls.finish += 1; },
  });
  return { controller, video, calls, timers };
}

test("intro becomes active only after a renderable first frame", () => {
  const { controller, video, calls } = createHarness();
  controller.start();
  video.emit("playing");
  assert.deepEqual(calls.active, []);
  assert.equal(controller.isActive(), false);

  video.emit("created");
  assert.deepEqual(calls.active, [true]);
  assert.equal(controller.isActive(), true);
});

test("stalled playback hides skip and resumes without another first frame", () => {
  const { controller, video, calls, timers } = createHarness();
  controller.start();
  video.emit("created");
  video.emit("stalled");
  timers.at(-1).callback();
  assert.equal(controller.isActive(), false);
  assert.equal(calls.inactive, 1);

  video.emit("playing");
  assert.equal(controller.isActive(), true);
  assert.deepEqual(calls.active, [true, false]);
});

test("benign browser suspend signal keeps the active intro visible", () => {
  const { controller, video, calls, timers } = createHarness();
  controller.start();
  video.emit("created");
  video.video.currentTime = 1;
  video.emit("stalled", video, { type: "suspend" });

  assert.equal(controller.isActive(), true);
  assert.equal(calls.inactive, 0);
  assert.deepEqual(calls.active, [true]);
  assert.equal(timers.length, 1);
});

test("progressing waiting signal does not interrupt the intro", () => {
  const { controller, video, calls, timers } = createHarness();
  controller.start();
  video.emit("created");
  video.video.currentTime = 1;
  video.emit("stalled", video, { type: "waiting" });
  video.video.currentTime = 1.4;
  timers.at(-1).callback();

  assert.equal(controller.isActive(), true);
  assert.equal(calls.inactive, 0);
});

test("video failure and repeated events finish the intro only once", () => {
  const { controller, video, calls } = createHarness();
  controller.start();
  video.emit("error");
  video.emit("complete");
  video.emit("unsupported");
  assert.equal(video.stopCount, 1);
  assert.equal(calls.finish, 1);
  assert.equal(controller.isActive(), false);
});

test("startup watchdog prevents a permanently frozen menu frame", () => {
  const { controller, video, calls, timers } = createHarness();
  controller.start();
  timers[0].callback();
  assert.equal(video.stopCount, 1);
  assert.equal(calls.finish, 1);
});

test("autoplay lock remains visible but cannot trap the player", () => {
  const { controller, video, calls, timers } = createHarness();
  controller.start();
  video.emit("locked");
  timers.at(-1).callback();

  assert.equal(controller.isActive(), false);
  assert.equal(video.stopCount, 1);
  assert.equal(calls.finish, 1);
});
