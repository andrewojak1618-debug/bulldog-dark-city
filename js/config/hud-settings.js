import { getAssetPath } from "./asset-paths.js";

/**
 * Zentrale Gestaltung, Positionen und Assetpfade des Level-HUDs.
 */
export const HUD = Object.freeze({
  depth: 200,
  health: Object.freeze({
    maximum: 100,
    x: 14,
    y: 50,
    width: 137.5,
    height: 28.05,
    textureKey: "hud-health-bar-frame",
    path: getAssetPath("ui", "hud/health-bar-frame.png"),
    fillX: 35.2,
    fillY: 7.7,
    fillWidth: 97.35,
    fillHeight: 11,
    fillBackgroundColor: 0x19040e,
    fillBackgroundAlpha: 0.9,
    fillColor: 0xff075f,
    fillRadius: 2,
    textStyle: Object.freeze({
      fontFamily: "Arial",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#ffffff",
      stroke: "#14010b",
      strokeThickness: 2,
    }),
  }),
  coin: Object.freeze({
    x: 14,
    y: 83.05,
    width: 90,
    height: 31.2,
    textX: 62.4,
    textY: 15.6,
    textureKey: "hud-coin-bar-frame",
    path: getAssetPath("ui", "hud/coin-bar-frame.png"),
  }),
  serum: Object.freeze({
    x: 14,
    y: 119.25,
    width: 94.8,
    height: 31.2,
    textX: 64.8,
    textY: 15.6,
    textureKey: "hud-serum-bar-frame",
    path: getAssetPath("ui", "hud/serum-bar-frame.png"),
    fill: Object.freeze({
      maximum: 2,
      durationMs: 1400,
      x: 26.5,
      y: 8.5,
      width: 64,
      height: 14.5,
      waveAmplitude: 1.2,
      waveLength: 10,
      colorLeft: 0x28f596,
      colorRight: 0xb52cff,
      colorBottomLeft: 0x087c60,
      colorBottomRight: 0x61199c,
      alpha: 0.9,
    }),
  }),
  futureMutation: Object.freeze({
    textureKey: "hud-mutation-bar-frame",
    path: getAssetPath("ui", "hud/mutation-bar-frame.png"),
  }),
  collectibleTextStyle: Object.freeze({
    fontFamily: "Permanent Marker",
    fontSize: "12px",
    color: "#ffffff",
    stroke: "#09010f",
    strokeThickness: 2,
  }),
});

/**
 * Schlüssel der bereits im normalen HUD angezeigten Sammelobjekte.
 */
export const COLLECTIBLE_KEYS = Object.freeze({
  coins: "coins",
  serum: "serum",
});
