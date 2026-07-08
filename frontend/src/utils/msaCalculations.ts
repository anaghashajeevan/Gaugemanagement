// src/utils/msaCalculations.ts
// AIAG MSA-4 based Measurement System Analysis calculations

// ═══════════════════════════════════════════════════════════════════
// AIAG CONSTANTS
// ═══════════════════════════════════════════════════════════════════

/** d2* constants for range-based standard deviation estimation */
const D2_TABLE: Record<number, number> = {
  2: 1.128, 3: 1.693, 4: 2.059, 5: 2.326,
  6: 2.534, 7: 2.704, 8: 2.847, 9: 2.970, 10: 3.078,
};

/** K1 constants for Repeatability (based on number of trials) */
const K1_TABLE: Record<number, number> = {
  2: 4.56, 3: 3.05,
};

/** K2 constants for Reproducibility (based on number of appraisers) */
const K2_TABLE: Record<number, number> = {
  2: 3.65, 3: 2.70, 4: 2.30, 5: 2.08,
};

/** K3 constants for Part Variation (based on number of parts) */
const K3_TABLE: Record<number, number> = {
  2: 3.65, 3: 2.70, 4: 2.30, 5: 2.08,
  6: 1.93, 7: 1.82, 8: 1.74, 9: 1.67, 10: 1.62,
};

/** t-critical values at 95% confidence, 2-tailed */
const T_CRITICAL_95: Record<number, number> = {
  1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
  6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
  15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042,
};

function getTCritical(df: number): number {
  if (df >= 30) return 2.042;
  if (df >= 25) return 2.060;
  if (df >= 20) return 2.086;
  if (df >= 15) return 2.131;
  return T_CRITICAL_95[df] || 2.228;
}

// ═══════════════════════════════════════════════════════════════════
// RESULT TYPES
// ═══════════════════════════════════════════════════════════════════

export interface GRRResult {
  ev: number;              // Equipment Variation (raw)
  av: number;              // Appraiser Variation (raw)
  grr: number;             // Gauge R&R (raw)
  pv: number;              // Part Variation (raw)
  tv: number;              // Total Variation (raw)
  evPercent: number;       // %EV = 100 × (EV/TV)
  avPercent: number;       // %AV
  grrPercent: number;      // %GRR ← Main pass/fail
  pvPercent: number;       // %PV
  ndc: number;             // Number of Distinct Categories
  passFail: 'Pass' | 'Borderline' | 'Fail';
  interpretation: string;
}

export interface BiasResult {
  bias: number;            // Average − Reference
  avgMeasurement: number;
  stdDev: number;
  stdError: number;        // σ / √n
  tStatistic: number;
  tCritical: number;
  significant: boolean;    // Is bias statistically significant?
  passFail: 'Pass' | 'Borderline' | 'Fail';
  interpretation: string;
}

export interface LinearityResult {
  slope: number;
  intercept: number;
  rSquared: number;
  maxBias: number;
  pointResults: {
    referenceValue: number;
    avgMeasured: number;
    bias: number;
  }[];
  passFail: 'Pass' | 'Borderline' | 'Fail';
  interpretation: string;
}

export interface UncertaintyResult {
  uRepeatability: number;    // From EV of GRR
  uReproducibility: number;  // From AV of GRR
  uReference: number;        // From calibration standard
  uResolution: number;       // From gauge resolution
  combinedUncertainty: number;  // u_c
  expandedUncertainty: number;  // U = k × u_c
  coverageFactor: number;       // k (usually 2)
  passFail: 'Pass' | 'Borderline' | 'Fail';
  interpretation: string;
}

// ═══════════════════════════════════════════════════════════════════
// GR&R CALCULATION (Average and Range Method)
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate GR&R using AIAG Average and Range Method.
 *
 * @param data - 3D array: data[appraiser][part][trial] = measurement
 * @param numTrials - Number of trials per part per appraiser
 * @param numParts - Number of parts
 * @param numAppraisers - Number of appraisers
 * @param tolerance - Optional: total tolerance for %GRR vs Tolerance
 */
export function calculateGRR(
  data: number[][][],
  numTrials: number,
  numParts: number,
  numAppraisers: number,
): GRRResult {
  // ─── Get AIAG constants ─────────────────────────────────────────
  const K1 = K1_TABLE[numTrials] || 3.05;
  const K2 = K2_TABLE[numAppraisers] || 2.70;
  const K3 = K3_TABLE[numParts] || 1.62;

  // ─── Step 1: Calculate ranges per (appraiser × part) ────────────
  // R̄_a = average range per appraiser
  const appraiserRanges: number[] = [];
  const appraiserMeans: number[] = [];

  for (let a = 0; a < numAppraisers; a++) {
    const rangesPerPart: number[] = [];
    const allValues: number[] = [];

    for (let p = 0; p < numParts; p++) {
      const trials = data[a][p];
      if (trials && trials.length > 0) {
        const rng = Math.max(...trials) - Math.min(...trials);
        rangesPerPart.push(rng);
        allValues.push(...trials);
      }
    }

    const avgRange = rangesPerPart.length > 0
      ? rangesPerPart.reduce((s, v) => s + v, 0) / rangesPerPart.length
      : 0;
    appraiserRanges.push(avgRange);

    const avgAll = allValues.length > 0
      ? allValues.reduce((s, v) => s + v, 0) / allValues.length
      : 0;
    appraiserMeans.push(avgAll);
  }

  // R̄ = overall average range
  const rBar = appraiserRanges.reduce((s, v) => s + v, 0) / appraiserRanges.length;

  // X̄diff = max appraiser mean − min appraiser mean
  const xDiff = Math.max(...appraiserMeans) - Math.min(...appraiserMeans);

  // ─── Step 2: Equipment Variation (Repeatability) ────────────────
  // EV = K1 × R̄
  const ev = K1 * rBar;

  // ─── Step 3: Appraiser Variation (Reproducibility) ──────────────
  // AV = √((X̄diff × K2)² − EV²/(n×r))
  const avSquared = Math.pow(xDiff * K2, 2) - Math.pow(ev, 2) / (numParts * numTrials);
  const av = Math.sqrt(Math.max(avSquared, 0));

  // ─── Step 4: GR&R ───────────────────────────────────────────────
  // GRR = √(EV² + AV²)
  const grr = Math.sqrt(ev * ev + av * av);

  // ─── Step 5: Part Variation ─────────────────────────────────────
  // For each part, get average across all appraisers × trials
  const partMeans: number[] = [];
  for (let p = 0; p < numParts; p++) {
    const allValues: number[] = [];
    for (let a = 0; a < numAppraisers; a++) {
      if (data[a][p]) allValues.push(...data[a][p]);
    }
    const mean = allValues.length > 0
      ? allValues.reduce((s, v) => s + v, 0) / allValues.length
      : 0;
    partMeans.push(mean);
  }

  // Rp = max part mean − min part mean
  const rp = Math.max(...partMeans) - Math.min(...partMeans);

  // PV = Rp × K3
  const pv = rp * K3;

  // ─── Step 6: Total Variation ────────────────────────────────────
  // TV = √(GRR² + PV²)
  const tv = Math.sqrt(grr * grr + pv * pv);

  // ─── Step 7: Percentages ────────────────────────────────────────
  const evPercent = tv > 0 ? (ev / tv) * 100 : 0;
  const avPercent = tv > 0 ? (av / tv) * 100 : 0;
  const grrPercent = tv > 0 ? (grr / tv) * 100 : 0;
  const pvPercent = tv > 0 ? (pv / tv) * 100 : 0;

  // ─── Step 8: Number of Distinct Categories ──────────────────────
  const ndc = grr > 0 ? Math.floor(1.41 * (pv / grr)) : 0;

  // ─── Step 9: Pass/Fail determination (AIAG MSA-4) ───────────────
  let passFail: 'Pass' | 'Borderline' | 'Fail';
  let interpretation: string;

  if (grrPercent < 10) {
    passFail = 'Pass';
    interpretation = 'Measurement system is ACCEPTABLE (%GRR < 10%). NDC ≥ 5 required.';
  } else if (grrPercent <= 30) {
    passFail = 'Borderline';
    interpretation = 'Measurement system is MARGINAL (10% ≤ %GRR ≤ 30%). Acceptable based on application, cost, and gauge criticality.';
  } else {
    passFail = 'Fail';
    interpretation = 'Measurement system is NOT ACCEPTABLE (%GRR > 30%). Improvement required.';
  }

  if (ndc < 5) {
    interpretation += ` NDC = ${ndc} (should be ≥ 5 for adequate part discrimination).`;
  }

  return {
    ev: round(ev, 6),
    av: round(av, 6),
    grr: round(grr, 6),
    pv: round(pv, 6),
    tv: round(tv, 6),
    evPercent: round(evPercent, 2),
    avPercent: round(avPercent, 2),
    grrPercent: round(grrPercent, 2),
    pvPercent: round(pvPercent, 2),
    ndc,
    passFail,
    interpretation,
  };
}

// ═══════════════════════════════════════════════════════════════════
// BIAS CALCULATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate Bias with t-statistic for statistical significance.
 *
 * @param readings - Array of measurements of the same reference part
 * @param referenceValue - Known true value of the reference
 */
export function calculateBias(
  readings: number[],
  referenceValue: number,
): BiasResult {
  const n = readings.length;

  // Average of measurements
  const avg = readings.reduce((s, v) => s + v, 0) / n;

  // Bias = X̄ − Reference
  const bias = avg - referenceValue;

  // Standard deviation
  const variance = readings.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);

  // Standard error = σ / √n
  const stdError = stdDev / Math.sqrt(n);

  // t-statistic = Bias / stdError
  const tStatistic = stdError > 0 ? bias / stdError : 0;

  // t-critical (95%, 2-tailed, df = n-1)
  const tCritical = getTCritical(n - 1);

  // Is bias statistically significant?
  const significant = Math.abs(tStatistic) > tCritical;

  // Pass/Fail (bias should be close to 0)
  const absBias = Math.abs(bias);
  let passFail: 'Pass' | 'Borderline' | 'Fail';
  let interpretation: string;

  // Using relative bias thresholds (as fraction of reference)
  const relativeBias = referenceValue !== 0 ? absBias / Math.abs(referenceValue) : absBias;

  if (!significant) {
    passFail = 'Pass';
    interpretation = `Bias is NOT statistically significant (|t|=${Math.abs(tStatistic).toFixed(3)} < t-critical=${tCritical.toFixed(3)}). Measurement system has acceptable bias.`;
  } else if (relativeBias < 0.005) {
    passFail = 'Borderline';
    interpretation = `Bias IS statistically significant but small in magnitude (${(relativeBias * 100).toFixed(3)}% of reference). Review for corrective action.`;
  } else {
    passFail = 'Fail';
    interpretation = `Bias IS statistically significant and substantial (${(relativeBias * 100).toFixed(3)}% of reference). Correction or investigation required.`;
  }

  return {
    bias: round(bias, 6),
    avgMeasurement: round(avg, 6),
    stdDev: round(stdDev, 6),
    stdError: round(stdError, 6),
    tStatistic: round(tStatistic, 4),
    tCritical: round(tCritical, 4),
    significant,
    passFail,
    interpretation,
  };
}

// ═══════════════════════════════════════════════════════════════════
// LINEARITY CALCULATION (Least Squares Regression)
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate Linearity: how bias changes across the measurement range.
 *
 * @param referenceValues - True values at each reference point
 * @param measurements - 2D array: measurements[refIndex][trial]
 * @param processVariation - Optional: process variation for %Linearity
 */
export function calculateLinearity(
  referenceValues: number[],
  measurements: number[][],
  processVariation?: number,
): LinearityResult {
  // Calculate bias at each reference point
  const pointResults = referenceValues.map((ref, i) => {
    const trials = measurements[i] || [];
    const avgMeasured = trials.length > 0
      ? trials.reduce((s, v) => s + v, 0) / trials.length
      : 0;
    return {
      referenceValue: ref,
      avgMeasured: round(avgMeasured, 6),
      bias: round(avgMeasured - ref, 6),
    };
  });

  // ─── Linear regression: Bias = a + b × Reference ────────────────
  const n = pointResults.length;
  const sumX = pointResults.reduce((s, p) => s + p.referenceValue, 0);
  const sumY = pointResults.reduce((s, p) => s + p.bias, 0);
  const sumXY = pointResults.reduce((s, p) => s + p.referenceValue * p.bias, 0);
  const sumXX = pointResults.reduce((s, p) => s + p.referenceValue * p.referenceValue, 0);
  const sumYY = pointResults.reduce((s, p) => s + p.bias * p.bias, 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  // Slope (b) and intercept (a)
  const denom = sumXX - n * meanX * meanX;
  const slope = denom !== 0 ? (sumXY - n * meanX * meanY) / denom : 0;
  const intercept = meanY - slope * meanX;

  // R²
  const ssTotal = sumYY - n * meanY * meanY;
  const ssResidual = pointResults.reduce((s, p) => {
    const predicted = intercept + slope * p.referenceValue;
    return s + Math.pow(p.bias - predicted, 2);
  }, 0);
  const rSquared = ssTotal !== 0 ? 1 - ssResidual / ssTotal : 0;

  // Max absolute bias
  const maxBias = Math.max(...pointResults.map((p) => Math.abs(p.bias)));

  // ─── Pass/Fail ──────────────────────────────────────────────────
  let passFail: 'Pass' | 'Borderline' | 'Fail';
  let interpretation: string;

  const linearityMetric = processVariation && processVariation > 0
    ? (maxBias / processVariation) * 100
    : maxBias * 100;

  // Simple thresholds (customize as needed)
  if (maxBias <= 0.01) {
    passFail = 'Pass';
    interpretation = `Linearity is ACCEPTABLE. Max bias = ${maxBias.toFixed(4)} across the range. R² = ${rSquared.toFixed(4)}.`;
  } else if (maxBias <= 0.03) {
    passFail = 'Borderline';
    interpretation = `Linearity is MARGINAL. Max bias = ${maxBias.toFixed(4)}. Slope = ${slope.toFixed(6)}. Consider investigation.`;
  } else {
    passFail = 'Fail';
    interpretation = `Linearity is NOT ACCEPTABLE. Max bias = ${maxBias.toFixed(4)}. Significant variation across range detected.`;
  }

  return {
    slope: round(slope, 6),
    intercept: round(intercept, 6),
    rSquared: round(rSquared, 4),
    maxBias: round(maxBias, 6),
    pointResults,
    passFail,
    interpretation,
  };
}

// ═══════════════════════════════════════════════════════════════════
// UNCERTAINTY CALCULATION (ISO GUM approach)
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate Measurement Uncertainty using ISO GUM.
 * Auto-pulls repeatability and reproducibility from a linked GR&R study.
 *
 * @param ev - Equipment Variation from GRR study
 * @param av - Appraiser Variation from GRR study
 * @param standardUncertainty - Uncertainty from calibration standard
 * @param resolution - Gauge resolution
 * @param coverageFactor - k (2 for ~95% confidence)
 */
export function calculateUncertainty(
  ev: number,
  av: number,
  standardUncertainty: number,
  resolution: number,
  coverageFactor: number = 2,
): UncertaintyResult {
  // u_repeatability = EV / K1 → we treat EV as already the standard uncertainty component
  // In simplified GUM: EV is already 5.15σ, so σ = EV/5.15
  const uRepeatability = ev / 5.15;

  // u_reproducibility from AV
  const uReproducibility = av / 5.15;

  // u_reference from calibration certificate
  const uReference = standardUncertainty;

  // u_resolution = resolution / (2 × √3) — rectangular distribution
  const uResolution = resolution / (2 * Math.sqrt(3));

  // Combined uncertainty (RSS)
  const combinedUncertainty = Math.sqrt(
    uRepeatability ** 2 +
    uReproducibility ** 2 +
    uReference ** 2 +
    uResolution ** 2
  );

  // Expanded uncertainty
  const expandedUncertainty = coverageFactor * combinedUncertainty;

  // ─── Pass/Fail (based on expanded uncertainty magnitude) ────────
  let passFail: 'Pass' | 'Borderline' | 'Fail';
  let interpretation: string;

  if (expandedUncertainty <= 0.05) {
    passFail = 'Pass';
    interpretation = `Expanded uncertainty U = ±${expandedUncertainty.toFixed(4)} (k=${coverageFactor}). Measurement system uncertainty is ACCEPTABLE.`;
  } else if (expandedUncertainty <= 0.10) {
    passFail = 'Borderline';
    interpretation = `Expanded uncertainty U = ±${expandedUncertainty.toFixed(4)} (k=${coverageFactor}). Uncertainty is MARGINAL — review dominant components.`;
  } else {
    passFail = 'Fail';
    interpretation = `Expanded uncertainty U = ±${expandedUncertainty.toFixed(4)} (k=${coverageFactor}). Uncertainty is TOO HIGH for reliable measurement.`;
  }

  return {
    uRepeatability: round(uRepeatability, 6),
    uReproducibility: round(uReproducibility, 6),
    uReference: round(uReference, 6),
    uResolution: round(uResolution, 6),
    combinedUncertainty: round(combinedUncertainty, 6),
    expandedUncertainty: round(expandedUncertainty, 6),
    coverageFactor,
    passFail,
    interpretation,
  };
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY: Rounding
// ═══════════════════════════════════════════════════════════════════

function round(value: number, decimals: number = 4): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}