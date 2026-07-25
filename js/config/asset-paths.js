export const ASSET_PATHS = Object.freeze({
  images: "/img/images",
  sprites: "/img/sprites",
  tilesets: "/img/tilesets",
  backgrounds: "/img/backgrounds",
  ui: "/img/ui",
  fonts: "/img/fonts",
  audio: "/audio",
});

/**
 * Erstellt einen vollständigen Pfad innerhalb einer Assetgruppe.
 * @param {keyof typeof ASSET_PATHS} group - Name der registrierten Assetgruppe.
 * @param {string} fileName - Dateiname oder relativer Pfad in der Gruppe.
 * @returns {string} Vollständiger öffentlicher Assetpfad.
 */
export const getAssetPath = (group, fileName) =>
  `${ASSET_PATHS[group]}/${fileName}`;
