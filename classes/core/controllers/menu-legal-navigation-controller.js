/**
 * Returns menu legal navigation.
 * @returns {HTMLElement|null} The resulting value.
 */
function getMenuLegalNavigation() {
  return document.getElementById("menu-legal-navigation");
}

/**
 * Sets menu legal navigation visibility.
 * @param {boolean} isVisible - The is visible value.
 * @returns {void} No value is returned.
 */
export function setMenuLegalNavigationVisibility(isVisible) {
  const navigation = getMenuLegalNavigation();
  const link = navigation?.querySelector("a");
  if (!navigation || !link) return;
  navigation.classList.toggle("site-footer--visible", isVisible);
  navigation.setAttribute("aria-hidden", String(!isVisible));
  link.tabIndex = isVisible ? 0 : -1;
  if (!isVisible) link.blur();
}
