/**
 * Centralized Area Conversion Utility
 * Standard conversion factors for Indian & global land measurement units.
 * Primary internal base unit: Acres (1 Acre = 1.0)
 */

export const UNIT_TO_ACRE = {
  acre: 1.0,
  acres: 1.0,
  hectare: 2.47105,
  hectares: 2.47105,
  ha: 2.47105,
  bigha: 0.625,        // Standard Bigha (0.2529 ha ≈ 0.625 acres)
  bighas: 0.625,
  guntha: 0.025,       // 1 Guntha = 1/40 Acre
  gunthas: 0.025,
  cent: 0.01,          // 1 Cent = 1/100 Acre
  cents: 0.01,
  kanal: 0.125,        // 1 Kanal = 1/8 Acre
  kanals: 0.125,
  marla: 0.00625,      // 1 Marla = 1/160 Acre
  marlas: 0.00625,
  sq_ft: 0.0000229568,
  sq_m: 0.000247105,
};

/**
 * Convert any value and unit to internal Acre representation.
 * @param {number|string} area 
 * @param {string} unit 
 * @returns {number} area in Acres
 */
export const toAcres = (area, unit = 'Acres') => {
  const num = parseFloat(area) || 0;
  if (num <= 0) return 0;
  const unitKey = String(unit || 'acres').trim().toLowerCase();
  const factor = UNIT_TO_ACRE[unitKey] !== undefined ? UNIT_TO_ACRE[unitKey] : 1.0;
  return num * factor;
};

/**
 * Convert area in Acres to target unit.
 * @param {number} acres 
 * @param {string} targetUnit 
 * @returns {number}
 */
export const fromAcres = (acres, targetUnit = 'Acres') => {
  const num = parseFloat(acres) || 0;
  if (num <= 0) return 0;
  const unitKey = String(targetUnit || 'acres').trim().toLowerCase();
  const factor = UNIT_TO_ACRE[unitKey] || 1.0;
  return num / factor;
};

/**
 * Format total area with pretty display.
 * @param {Array<{area: number|string, areaUnit?: string, area_unit?: string}>} farms 
 * @param {string} displayUnit 
 * @returns {string} e.g. "11.3 Acres"
 */
export const calculateTotalLandAcres = (farms = []) => {
  if (!Array.isArray(farms)) return 0;
  return farms.reduce((sum, f) => {
    const rawVal = f.area !== undefined ? f.area : (f.farm_area !== undefined ? f.farm_area : 0);
    const rawUnit = f.areaUnit || f.area_unit || 'Acres';
    return sum + toAcres(rawVal, rawUnit);
  }, 0);
};
