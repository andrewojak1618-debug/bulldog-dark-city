/**
 * Bündelt Asset- und Animationswerte des Übergangs vom Menü zum ersten Level.
 */
export const MENU_START_TRANSITION = Object.freeze({
  video: Object.freeze({
    key: "bulldog-dark-city-intro",
    url: new URL(
      "../../video/intro/bulldog-dark-city-intro.mp4",
      import.meta.url,
    ).href,
    noAudio: false,
    volume: 1,
  }),
  flyOut: Object.freeze({
    duration: 620,
    stagger: 35,
    leftDistance: 280,
    rightDistance: 180,
    bottomDistance: 80,
    ease: "Back.easeIn",
  }),
  videoReveal: Object.freeze({
    delay: 260,
    duration: 360,
    ease: "Sine.easeOut",
  }),
  depths: Object.freeze({
    video: 10,
    interface: 20,
  }),
});
