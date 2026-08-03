export const ASSET_PATHS = Object.freeze({
  images: "img/images",
  sprites: "img/sprites",
  tilesets: "img/tilesets",
  backgrounds: "img/backgrounds",
  environment: "img/environment",
  ui: "img/ui",
  fonts: "fonts",
  audio: "audio",
  data: "data",
});

/**
 * Erstellt einen vollständigen Pfad innerhalb einer Assetgruppe.
 * @param {keyof typeof ASSET_PATHS} group - Name der registrierten Assetgruppe.
 * @param {string} fileName - Dateiname oder relativer Pfad in der Gruppe.
 * @returns {string} Vollständiger öffentlicher Assetpfad.
 */
export const getAssetPath = (group, fileName) =>
  `${import.meta.env.BASE_URL}${ASSET_PATHS[group]}/${fileName}`;
