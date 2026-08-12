import { getAssetPath } from "./asset-paths.js";

const HEALTH_SCALE = 1.5;
const HEALTH_Y = 50;
const HEALTH_BASE_HEIGHT = 28.05;
const HEALTH_HEIGHT = HEALTH_BASE_HEIGHT * HEALTH_SCALE;
const HUD_ROW_GAP = 5;
const COLLECTIBLE_SCALE = 1.25;
const COLLECTIBLE_BASE_HEIGHT = 31.2;
const COIN_HEIGHT = COLLECTIBLE_BASE_HEIGHT * COLLECTIBLE_SCALE;
const COIN_Y = HEALTH_Y + HEALTH_HEIGHT + HUD_ROW_GAP;
const SERUM_Y = COIN_Y + COIN_HEIGHT + HUD_ROW_GAP;

/**
 * Zentrale Gestaltung, Positionen und Assetpfade des Level-HUDs.
 */
export const HUD = Object.freeze({
  depth: 200,
  levelMenuHint: Object.freeze({
    x: 360,
    y: 24,
    textTemplate: "LEVEL {level} · ESC · ZURÜCK ZUM MENÜ",
    color: "#d7d2dc",
    fontFamily: "Arial",
    fontSize: "14px",
    depth: 100,
  }),
  health: Object.freeze({
    maximum: 100,
    x: 14,
    y: HEALTH_Y,
    width: 137.5 * HEALTH_SCALE,
    height: HEALTH_HEIGHT,
    textureKey: "hud-health-bar-frame",
    path: getAssetPath("ui", "hud/health-bar-frame.png"),
    fillX: 35.2 * HEALTH_SCALE,
    fillY: 7.7 * HEALTH_SCALE,
    fillWidth: 97.35 * HEALTH_SCALE,
    fillHeight: 11 * HEALTH_SCALE,
    fillBackgroundColor: 0x19040e,
    fillBackgroundAlpha: 0.9,
    fillColor: 0xff075f,
    fillRadius: 2 * HEALTH_SCALE,
    textStyle: Object.freeze({
      fontFamily: "Arial",
      fontSize: `${9 * HEALTH_SCALE}px`,
      fontStyle: "bold",
      color: "#ffffff",
      stroke: "#14010b",
      strokeThickness: 2 * HEALTH_SCALE,
    }),
  }),
  coin: Object.freeze({
    x: 14,
    y: COIN_Y,
    width: 90 * COLLECTIBLE_SCALE,
    height: COIN_HEIGHT,
    textX: 62.4 * COLLECTIBLE_SCALE,
    textY: 15.6 * COLLECTIBLE_SCALE,
    textureKey: "hud-coin-bar-frame",
    path: getAssetPath("ui", "hud/coin-bar-frame.png"),
    fill: Object.freeze({
      maximum: 1000,
      durationMs: 1800,
      x: 31.5 * COLLECTIBLE_SCALE,
      y: 8 * COLLECTIBLE_SCALE,
      width: 54.5 * COLLECTIBLE_SCALE,
      height: 15 * COLLECTIBLE_SCALE,
      waveAmplitude: 0.35 * COLLECTIBLE_SCALE,
      waveLength: 12 * COLLECTIBLE_SCALE,
      colorLeft: 0x7a22d4,
      colorRight: 0xd13cff,
      colorBottomLeft: 0x46107f,
      colorBottomRight: 0x8e1dc1,
      alpha: 0.92,
    }),
  }),
  serum: Object.freeze({
    x: 14,
    y: SERUM_Y,
    width: 94.8 * COLLECTIBLE_SCALE,
    height: COLLECTIBLE_BASE_HEIGHT * COLLECTIBLE_SCALE,
    textX: 64.8 * COLLECTIBLE_SCALE,
    textY: 15.6 * COLLECTIBLE_SCALE,
    textureKey: "hud-serum-bar-frame",
    path: getAssetPath("ui", "hud/serum-bar-frame.png"),
    fill: Object.freeze({
      maximum: 2,
      durationMs: 1400,
      x: 26.5 * COLLECTIBLE_SCALE,
      y: 8.5 * COLLECTIBLE_SCALE,
      width: 64 * COLLECTIBLE_SCALE,
      height: 14.5 * COLLECTIBLE_SCALE,
      waveAmplitude: 1.2 * COLLECTIBLE_SCALE,
      waveLength: 10 * COLLECTIBLE_SCALE,
      colorLeft: 0x28f596,
      colorRight: 0xb52cff,
      colorBottomLeft: 0x087c60,
      colorBottomRight: 0x61199c,
      alpha: 0.9,
    }),
  }),
  mutation: Object.freeze({
    x: 14,
    y: 50,
    width: 150.6,
    height: 60,
    hiddenX: -165,
    normalHudExitX: -165,
    exitDurationMs: 450,
    entryDelayMs: 260,
    entryDurationMs: 520,
    fillX: 38,
    fillY: 20,
    fillWidth: 104,
    fillHeight: 29,
    fillRadius: 10,
    fillColor: 0x4dff37,
    fillGlowColor: 0xb8ff68,
    fillAlpha: 0.9,
    textureKey: "hud-mutation-bar-frame",
    path: getAssetPath("ui", "hud/mutation-bar-frame.png"),
  }),
  mutationReady: Object.freeze({
    x: 14 + 94.8 * COLLECTIBLE_SCALE + 5.2,
    y: SERUM_Y + 3.75 * COLLECTIBLE_SCALE,
    keyWidth: 48,
    keyHeight: 24,
    pulseAlphaMin: 0.58,
    pulseAlphaMax: 1,
    pulseDurationMs: 700,
    keyStyle: Object.freeze({
      fontFamily: "Permanent Marker",
      fontSize: "14px",
      color: "#ffffff",
      stroke: "#14031d",
      strokeThickness: 2,
    }),
    labelStyle: Object.freeze({
      fontFamily: "Permanent Marker",
      fontSize: "14px",
      color: "#8dffbf",
      stroke: "#2d073e",
      strokeThickness: 3,
    }),
  }),
  collectibleTextStyle: Object.freeze({
    fontFamily: "Permanent Marker",
    fontSize: `${12 * COLLECTIBLE_SCALE}px`,
    color: "#ffffff",
    stroke: "#09010f",
    strokeThickness: 2 * COLLECTIBLE_SCALE,
  }),
});

/**
 * Schlüssel der bereits im normalen HUD angezeigten Sammelobjekte.
 */
export const COLLECTIBLE_KEYS = Object.freeze({
  coins: "coins",
  serum: "serum",
});
