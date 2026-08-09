import assert from "node:assert/strict";
import test from "node:test";
import { InputDeviceDetector } from
  "../classes/input/input-device-detector.class.js";

/**
 * Führt eine Geräteprüfung mit kontrollierten Media-Query-Werten aus.
 * @param {Record<string, boolean>} queries - Ergebnisse je Media Query.
 * @param {Function} assertion - Auszuführende Prüfung.
 * @returns {void}
 */
function withWindowStub(queries, assertion, width = 390) {
  const previousWindow = globalThis.window;
  globalThis.window = {
    innerWidth: width,
    location: { search: "" },
    matchMedia: (query) => ({ matches: queries[query] ?? false }),
  };
  try {
    assertion();
  } finally {
    globalThis.window = previousWindow;
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

test("1024 Pixel bleiben auch bei emuliertem Touch im Desktoplayout", () => {
  withWindowStub({
    "(pointer: coarse) and (hover: none)": true,
  }, () => assert.equal(InputDeviceDetector.isTouchLayout(), false), 1024);
});
