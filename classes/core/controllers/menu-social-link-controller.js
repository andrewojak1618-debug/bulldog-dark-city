/**
 * Liefert den barrierearmen GitHub-Link außerhalb des Phaser-Canvas.
 * @returns {HTMLAnchorElement|null} Gefundener Profil-Link oder `null`.
 */
function getGitHubProfileLink() {
  return document.getElementById("github-profile-link");
}

/**
 * Schaltet Sichtbarkeit und Tastaturzugriff des GitHub-Links gemeinsam um.
 * @param {boolean} isVisible - Ob der Link im Hauptmenü sichtbar sein soll.
 * @returns {void}
 */
export function setMenuSocialLinkVisibility(isVisible) {
  const link = getGitHubProfileLink();
  if (!link) return;
  const isHidden = !isVisible;
  link.classList.toggle("github-profile-link--hidden", isHidden);
  link.setAttribute("aria-hidden", String(isHidden));
  link.tabIndex = isHidden ? -1 : 0;
  if (isHidden) link.blur();
}
