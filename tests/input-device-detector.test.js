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

test("iPad Mini erhält bei 1024 Pixeln die Touchsteuerung", () => {
  withWindowStub({
    "(pointer: coarse) and (hover: none)": true,
  }, () => assert.equal(InputDeviceDetector.isTouchLayout(), true), 1024);
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

[
  ["iPad Air", 1180],
  ["iPad Pro", 1366],
  ["Surface Pro 7", 1368],
  ["Asus Zenbook", 1280],
  ["Nest Hub", 1024],
  ["Nest Hub Max", 1280],
].forEach(([device, width]) => {
  test(`${device} erhält bei primärem Touch die Mobilansicht`, () => {
    withWindowStub({
      "(pointer: coarse) and (hover: none)": true,
    }, () => assert.equal(InputDeviceDetector.isTouchLayout(), true), width);
  });
});
