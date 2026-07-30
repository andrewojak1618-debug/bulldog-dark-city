import { TEST_LEVEL } from "../../js/config/test-level-settings.js";

/**
 * Ordnet die Position der Bulldogge einem Abschnitt des Levelverlaufs zu.
 */
export class LevelFlowSystem {
  /**
   * Ermittelt die konfigurierte Zone an einer horizontalen Weltposition.
   * @param {number} worldX - Horizontale Position innerhalb des Levels.
   * @returns {{key: string, label: string, startX: number, endX: number}}
   * Aktuelle Levelzone.
   */
  static getZoneAt(worldX) {
    return (
      TEST_LEVEL.flow.zones.find(
        ({ startX, endX }) => worldX >= startX && worldX < endX,
      ) ?? TEST_LEVEL.flow.zones.at(-1)
    );
  }
}
