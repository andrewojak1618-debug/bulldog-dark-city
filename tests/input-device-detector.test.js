import assert from "node:assert/strict";
import test from "node:test";
import { InputDeviceDetector } from
  "../classes/input/input-device-detector.class.js";

/**
 * Handles with window stub.
 * @param {Record<string, boolean>} queries - The queries value.
 * @param {Function} assertion - The assertion value.
 * @param {number} width - The width in pixels.
 * @param {number} height - The height in pixels.
 * @param {object} browser - The browser value.
 * @returns {void} No value is returned.
 */
function withWindowStub(
  queries,
  assertion,
  width = 390,
  height = 844,
  browser = {},
) {
  const previousWindow = globalThis.window;
  const previousNavigator = globalThis.navigator;
  globalThis.window = {
    innerWidth: width,
    innerHeight: height,
    location: { search: "" },
    matchMedia: (query) => ({ matches: queries[query] ?? false }),
  };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: browser,
  });
  try {
    assertion();
  } finally {
    globalThis.window = previousWindow;
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: previousNavigator,
    });
  }
}

test("Laptop mit zusätzlichem Touchscreen bleibt im Desktoplayout", () => {
  withWindowStub({
    "(pointer: coarse) and (hover: none)": false,
  }, () => assert.equal(InputDeviceDetector.isTouchLayout(), false));
});

test("Primäres Touchgerät erhält das mobile Layout", () => {
  withWindowStub({
    "(pointer: coarse) and (hover: none)": true,
  }, () => assert.equal(InputDeviceDetector.isTouchLayout(), true));
});

test("Mobiles Hochformat aktiviert den Drehhinweis", () => {
  withWindowStub({
    "(pointer: coarse) and (hover: none)": true,
    "(orientation: portrait)": true,
  }, () => assert.equal(
    InputDeviceDetector.isPortraitTouchLayout(),
    true,
  ));
});

test("1024 Pixel breite Laptopansicht ignoriert den Touch-Testschalter", () => {
  const previousWindow = globalThis.window;
  const previousDebugCheck = InputDeviceDetector.isLocalTouchTest;
  globalThis.window = {
    innerWidth: 1024,
    matchMedia: () => ({ matches: false }),
  };
  InputDeviceDetector.isLocalTouchTest = () => true;
  try {
    assert.equal(InputDeviceDetector.isTouchLayout(), false);
  } finally {
    InputDeviceDetector.isLocalTouchTest = previousDebugCheck;
    globalThis.window = previousWindow;
  }
});

test("iPad Mini erhält bei 1024 Pixeln die Touchsteuerung", () => {
  withWindowStub({
    "(pointer: coarse) and (hover: none)": true,
  }, () => assert.equal(InputDeviceDetector.isTouchLayout(), true),
  1024, 768, { userAgent: "Mozilla/5.0 (iPad)", maxTouchPoints: 5 });
});

test("lokaler Touch-Test bleibt bei 1024 Pixeln im Desktoplayout", () => {
  const previousWindow = globalThis.window;
  const previousDebugCheck = InputDeviceDetector.isLocalTouchTest;
  globalThis.window = {
    innerWidth: 1024,
    matchMedia: (query) => ({
      matches: query === "(orientation: landscape)",
    }),
  };
  InputDeviceDetector.isLocalTouchTest = () => true;
  try {
    assert.equal(InputDeviceDetector.isTouchLayout(), false);
  } finally {
    InputDeviceDetector.isLocalTouchTest = previousDebugCheck;
    globalThis.window = previousWindow;
  }
});

test("gesonderter Tablet-Test aktiviert Touch auch oberhalb 1024 Pixeln", () => {
  const previousWindow = globalThis.window;
  const previousTabletCheck = InputDeviceDetector.isLocalTabletTest;
  globalThis.window = {
    innerWidth: 1180,
    matchMedia: () => ({ matches: false }),
  };
  InputDeviceDetector.isLocalTabletTest = () => true;
  try {
    assert.equal(InputDeviceDetector.isTouchLayout(), true);
  } finally {
    InputDeviceDetector.isLocalTabletTest = previousTabletCheck;
    globalThis.window = previousWindow;
  }
});

test("Touchgerät unterhalb von 1024 Pixeln erhält Steuerungsbuttons", () => {
  withWindowStub({
    "(pointer: coarse) and (hover: none)": true,
  }, () => assert.equal(InputDeviceDetector.isTouchLayout(), true), 1023);
});

test("große Desktopanzeige bleibt ohne primären Touch im Desktoplayout", () => {
  withWindowStub({
    "(pointer: coarse) and (hover: none)": false,
  }, () => assert.equal(InputDeviceDetector.isTouchLayout(), false), 2560);
});

test("simuliertes Touch auf 4K bleibt im Desktoplayout", () => {
  withWindowStub({
    "(pointer: coarse) and (hover: none)": true,
  }, () => assert.equal(InputDeviceDetector.isTouchLayout(), false),
  2560, 1440, { userAgent: "Mozilla/5.0 (Windows NT 10.0)" });
});

test("simuliertes Touch auf Laptopgröße bleibt im Desktoplayout", () => {
  withWindowStub({
    "(pointer: coarse) and (hover: none)": true,
  }, () => assert.equal(InputDeviceDetector.isTouchLayout(), false),
  1366, 768, { userAgent: "Mozilla/5.0 (Windows NT 10.0)" });
});

test("mobile Browserkennung macht 1024 mal 1302 nicht zum Tablet", () => {
  withWindowStub({
    "(pointer: coarse) and (hover: none)": true,
    "(orientation: portrait)": true,
  }, () => assert.equal(InputDeviceDetector.isTouchLayout(), false),
  1024, 1302, { userAgent: "Mozilla/5.0 (Linux; Android 10; Mobile)" });
});

test("erkanntes Tablet bleibt gedreht im Touchlayout", () => {
  withWindowStub({
    "(pointer: coarse) and (hover: none)": true,
    "(orientation: portrait)": true,
  }, () => assert.equal(InputDeviceDetector.isPortraitTouchLayout(), true),
  912, 1368, { userAgent: "Mozilla/5.0 (Windows NT 10.0)" });
});

[
  ["iPad Air", 1180, 820, "Mozilla/5.0 (iPad)"],
  ["iPad Pro", 1366, 1024, "Mozilla/5.0 (iPad)"],
  ["Surface Pro 7", 1368, 912, "Mozilla/5.0 (Windows NT 10.0)"],
  ["Asus Zenbook", 1280, 853, "Mozilla/5.0 (Windows NT 10.0)"],
  ["Nest Hub", 1024, 600, "Mozilla/5.0 (X11; Linux x86_64)"],
  ["Nest Hub Max", 1280, 800, "Mozilla/5.0 (X11; Linux x86_64)"],
].forEach(([device, width, height, userAgent]) => {
  test(`${device} erhält bei primärem Touch die Mobilansicht`, () => {
    withWindowStub({
      "(pointer: coarse) and (hover: none)": true,
    }, () => assert.equal(InputDeviceDetector.isTouchLayout(), true),
    width, height, { userAgent, maxTouchPoints: 5 });
  });
});
