import { MENU_START_TRANSITION } from "./menu-transition-settings.js";

/** Bündelt Video-, Übergangs- und Ersatzwerte der Endsequenz. */
export const ENDING = Object.freeze({
  video: Object.freeze({
    key: "bulldog-dark-city-you-win",
    url: new URL(
      "../../video/ending/bulldog-dark-city-you-win.mp4",
      import.meta.url,
    ).href,
    noAudio: false,
    volume: 1,
  }),
  transition: Object.freeze({
    fadeToBlackMs: 300,
  }),
  skip: MENU_START_TRANSITION.skip,
  depths: Object.freeze({
    video: 10,
    skipHint: 20,
  }),
  fallback: Object.freeze({
    text: "YOU WIN",
    fontFamily: "Permanent Marker",
    fontSize: 44,
    color: "#92ff5f",
    returnDelayMs: 1_800,
  }),
});
