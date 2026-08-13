/**
 * Defines the game over configuration.
 */
export const GAME_OVER = Object.freeze({
  video: Object.freeze({
    key: "bulldog-dark-city-game-over",
    url: new URL(
      "../../video/game-over/bulldog-dark-city-game-over.mp4",
      import.meta.url,
    ).href,
    noAudio: false,
    volume: 1,
  }),
  fallback: Object.freeze({
    text: "GAME OVER",
    fontFamily: "Permanent Marker",
    fontSize: 44,
    color: "#ff1493",
    returnDelayMs: 1_800,
  }),
});
