/**
 * Returns git hub profile link.
 * @returns {HTMLAnchorElement|null} The resulting value.
 */
function getGitHubProfileLink() {
  return document.getElementById("github-profile-link");
}

/**
 * Sets menu social link visibility.
 * @param {boolean} isVisible - The is visible value.
 * @returns {void} No value is returned.
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
