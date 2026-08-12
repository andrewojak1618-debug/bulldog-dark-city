/**
 * Liefert die rechtliche Navigation des Hauptmenüs.
 * @returns {HTMLElement|null} Navigation oder `null`.
 */
function getMenuLegalNavigation() {
  return document.getElementById("menu-legal-navigation");
}

/**
 * Schaltet Sichtbarkeit und Tastaturzugriff des Impressums gemeinsam um.
 * @param {boolean} isVisible - Ob das Impressum erreichbar sein soll.
 * @returns {void}
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
