// ==========================================================
// GATE CS RANK ANALYZER — PREDICTION ENGINE
// ==========================================================
//
// Pipeline:
//
// Marks
//   ↓
// Estimate AIR independently for every usable historical year
// using log-rank interpolation
//   ↓
// Convert each historical AIR to a relative percentile
//   ↓
// Mean of usable historical percentiles
//   ↓
// Convert the combined percentile back to expected AIR
//
// IMPORTANT:
// - No extrapolation outside a year's observed marks range.
// - A year contributes only when its data covers the entered marks.
// - "Confidence" below means historical DATA SUPPORT,
//   not probability of admission or prediction accuracy.
// ==========================================================


// ----------------------------------------------------------
// GENERAL HELPERS
// ----------------------------------------------------------

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);


export function mean(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}


export function median(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 !== 0) {
    return sorted[middle];
  }

  return (
    (sorted[middle - 1] + sorted[middle]) / 2
  );
}


// ----------------------------------------------------------
// HISTORICAL DATA COVERAGE
// ----------------------------------------------------------

export function getObservedMarksRange(points) {
  if (!Array.isArray(points) || points.length === 0) {
    return null;
  }

  const validMarks = points
    .map((point) => Number(point.marks))
    .filter(Number.isFinite);

  if (!validMarks.length) {
    return null;
  }

  return {
    min: Math.min(...validMarks),
    max: Math.max(...validMarks),
  };
}


export function canInterpolate(points, marks) {
  const range = getObservedMarksRange(points);

  if (!range || !Number.isFinite(marks)) {
    return false;
  }

  return marks >= range.min && marks <= range.max;
}


// ----------------------------------------------------------
// MARKS → AIR
// ----------------------------------------------------------
//
// AIR is highly nonlinear.
//
// Example:
// a 2-mark change near AIR 100 can mean something very
// different from a 2-mark change near AIR 10,000.
//
// Therefore we interpolate log(AIR), rather than AIR itself.
// ----------------------------------------------------------

export function interpolateRankLog(points, marks) {
  if (!Array.isArray(points) || points.length < 2) {
    return null;
  }

  if (!canInterpolate(points, marks)) {
    return null;
  }

  const sorted = [...points]
    .filter(
      (point) =>
        Number.isFinite(Number(point.marks)) &&
        Number.isFinite(Number(point.rank)) &&
        Number(point.rank) > 0
    )
    .map((point) => ({
      marks: Number(point.marks),
      rank: Number(point.rank),
    }))
    .sort((a, b) => a.marks - b.marks);

  if (sorted.length < 2) {
    return null;
  }

  // Exact observation first.
  const exact = sorted.find(
    (point) => point.marks === marks
  );

  if (exact) {
    return exact.rank;
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const left = sorted[i];
    const right = sorted[i + 1];

    if (
      marks > left.marks &&
      marks < right.marks
    ) {
      const marksDistance =
        right.marks - left.marks;

      if (marksDistance === 0) {
        return Math.round(
          (left.rank + right.rank) / 2
        );
      }

      const position =
        (marks - left.marks) / marksDistance;

      const logLeft = Math.log(left.rank);
      const logRight = Math.log(right.rank);

      const interpolatedLogRank =
        logLeft +
        position * (logRight - logLeft);

      return Math.max(
        1,
        Math.round(Math.exp(interpolatedLogRank))
      );
    }
  }

  return null;
}


// ----------------------------------------------------------
// AIR ↔ RELATIVE PERCENTILE
// ----------------------------------------------------------
//
// This is a rank-position normalization used by OUR model.
// It should not be described as an official GATE percentile.
//
// Example:
// AIR 1000 means something slightly different when
// 80,000 candidates appeared vs 170,000 candidates.
//
// Normalizing lets us compare years more fairly.
// ----------------------------------------------------------

export function rankToPercentile(rank, appeared) {
  if (
    !Number.isFinite(rank) ||
    !Number.isFinite(appeared) ||
    rank < 1 ||
    appeared <= 0
  ) {
    return null;
  }

  const percentile =
    100 * (1 - (rank - 1) / appeared);

  return clamp(percentile, 0, 100);
}


export function percentileToRank(percentile, appeared) {
  if (
    !Number.isFinite(percentile) ||
    !Number.isFinite(appeared) ||
    appeared <= 0
  ) {
    return null;
  }

  const safePercentile =
    clamp(percentile, 0, 100);

  return Math.max(
    1,
    Math.round(
      1 +
        (1 - safePercentile / 100) *
          appeared
    )
  );
}


// ----------------------------------------------------------
// TARGET AIR → REQUIRED MARKS
// ----------------------------------------------------------
//
// Reverse the same log-rank relationship.
//
// Again: NO extrapolation.
// If target AIR lies outside a year's verified AIR range,
// that year does not contribute.
// ----------------------------------------------------------

export function marksForTargetRank(points, targetRank) {
  if (
    !Array.isArray(points) ||
    points.length < 2 ||
    !Number.isFinite(targetRank) ||
    targetRank < 1
  ) {
    return null;
  }

  const sorted = [...points]
    .filter(
      (point) =>
        Number.isFinite(Number(point.marks)) &&
        Number.isFinite(Number(point.rank)) &&
        Number(point.rank) > 0
    )
    .map((point) => ({
      marks: Number(point.marks),
      rank: Number(point.rank),
    }))
    .sort((a, b) => b.rank - a.rank);

  if (sorted.length < 2) {
    return null;
  }

  const largestRank = Math.max(
    ...sorted.map((point) => point.rank)
  );

  const smallestRank = Math.min(
    ...sorted.map((point) => point.rank)
  );

  if (
    targetRank > largestRank ||
    targetRank < smallestRank
  ) {
    return null;
  }

  const exact = sorted.find(
    (point) => point.rank === targetRank
  );

  if (exact) {
    return exact.marks;
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const left = sorted[i];
    const right = sorted[i + 1];

    const upperRank = Math.max(
      left.rank,
      right.rank
    );

    const lowerRank = Math.min(
      left.rank,
      right.rank
    );

    if (
      targetRank < upperRank &&
      targetRank > lowerRank
    ) {
      const logLeft = Math.log(left.rank);
      const logRight = Math.log(right.rank);
      const logTarget = Math.log(targetRank);

      const denominator =
        logRight - logLeft;

      if (denominator === 0) {
        return Number(
          (
            (left.marks + right.marks) / 2
          ).toFixed(2)
        );
      }

      const position =
        (logTarget - logLeft) /
        denominator;

      const estimatedMarks =
        left.marks +
        position *
          (right.marks - left.marks);

      return Number(
        estimatedMarks.toFixed(2)
      );
    }
  }

  return null;
}


// ----------------------------------------------------------
// GET EACH YEAR'S ESTIMATE
// ----------------------------------------------------------

export function getYearlyEstimates(
  marks,
  yearlyData
) {
  if (!Array.isArray(yearlyData)) {
    return [];
  }

  return yearlyData
    .map((year) => {
      const rank = interpolateRankLog(
        year.rankData,
        marks
      );

      if (rank === null) {
        return null;
      }

      const appeared = Number(
        year.official?.appeared
      );

      const percentile =
        rankToPercentile(rank, appeared);

      if (percentile === null) {
        return null;
      }

      return {
        year: year.year,
        rank,
        appeared,

        percentile: Number(
          percentile.toFixed(4)
        ),

        coverage:
          getObservedMarksRange(
            year.rankData
          ),
      };
    })
    .filter(Boolean);
}


// ----------------------------------------------------------
// HISTORICAL DATA SUPPORT
// ----------------------------------------------------------
//
// This is deliberately called "data support", rather than
// prediction accuracy.
//
// It considers:
// 1. how many historical years contributed
// 2. how much those years disagree
// ----------------------------------------------------------

function calculateConfidence(
  estimates,
  totalYears
) {
  if (!estimates.length) {
    return {
      level: "Low",
      reason:
        "No verified historical year covers this marks value.",
    };
  }

  if (estimates.length === 1) {
    return {
      level: "Low",
      reason:
        "Only one historical year covers this marks value.",
    };
  }

  const percentiles = estimates.map(
    (item) => item.percentile
  );

  const average = mean(percentiles);

  const variance = mean(
    percentiles.map((value) =>
      Math.pow(value - average, 2)
    )
  );

  const standardDeviation =
    Math.sqrt(variance);

  const coverageRatio =
    totalYears > 0
      ? estimates.length / totalYears
      : 0;

  if (
    estimates.length >= 4 &&
    coverageRatio >= 0.8 &&
    standardDeviation <= 0.5
  ) {
    return {
      level: "High",
      reason:
        "Strong multi-year coverage with relatively low historical variation.",
    };
  }

  if (
    estimates.length >= 3 &&
    standardDeviation <= 1.5
  ) {
    return {
      level: "Moderate",
      reason:
        "Multiple historical years support this estimate, with manageable variation.",
    };
  }

  return {
    level: "Low",
    reason:
      "Historical coverage is limited or outcomes vary substantially at this marks level.",
  };
}


// ----------------------------------------------------------
// TARGET ANALYSIS
// ----------------------------------------------------------

function analyzeTarget(
  targetRank,
  currentMarks,
  yearlyData
) {
  if (
    !Number.isFinite(targetRank) ||
    targetRank < 1
  ) {
    return {
      rank: targetRank,
      expectedMarks: null,
      marksGap: null,
      yearlyMarks: [],
      yearsUsed: 0,
    };
  }

  const yearlyMarks = yearlyData
    .map((year) => {
      const requiredMarks =
        marksForTargetRank(
          year.rankData,
          targetRank
        );

      if (requiredMarks === null) {
        return null;
      }

      return {
        year: year.year,
        marks: requiredMarks,
      };
    })
    .filter(Boolean);

  if (!yearlyMarks.length) {
    return {
      rank: targetRank,
      expectedMarks: null,
      marksGap: null,
      yearlyMarks: [],
      yearsUsed: 0,
    };
  }

  /*
    Median is used for target marks because it is less
    sensitive to one unusually easy/hard historical paper.
  */

  const targetMarksMedian = median(
    yearlyMarks.map((item) => item.marks)
  );

  const expectedMarks = Number(
    targetMarksMedian.toFixed(2)
  );

  const marksGap = Number(
    (
      expectedMarks - currentMarks
    ).toFixed(2)
  );

  return {
    rank: targetRank,
    expectedMarks,
    marksGap,
    yearlyMarks,
    yearsUsed: yearlyMarks.length,
  };
}


// ----------------------------------------------------------
// MAIN ANALYZER
// ----------------------------------------------------------

export function analyzeRank({
  marks,
  targetRank,
  yearlyData,
  referenceAppeared,
}) {
  if (
    !Number.isFinite(marks) ||
    !Array.isArray(yearlyData) ||
    yearlyData.length === 0
  ) {
    return null;
  }

  const yearlyRankEstimates =
    getYearlyEstimates(
      marks,
      yearlyData
    );

  const totalYears =
    yearlyData.length;

  const target = analyzeTarget(
    targetRank,
    marks,
    yearlyData
  );

  if (!yearlyRankEstimates.length) {
    return {
      expectedRank: null,
      expectedPercentile: null,

      yearsUsed: 0,
      totalYears,

      yearlyRankEstimates: [],

      likelyRange: {
        bestCase: null,
        conservativeCase: null,
      },

      confidence: {
        level: "Low",
        reason:
          "No verified historical data covers this marks value.",
      },

      target,
    };
  }

  // --------------------------------------------------------
  // CURRENT PRODUCTION CANDIDATE MODEL
  // --------------------------------------------------------
  //
  // Preliminary leave-one-year-out backtesting on the
  // currently overlapping dataset favored mean historical
  // percentile over direct AIR aggregation.
  //
  // We should continue re-running backtestModels.js as the
  // verified dataset becomes denser.
  // --------------------------------------------------------

  const historicalPercentiles =
    yearlyRankEstimates.map(
      (item) => item.percentile
    );

  const expectedPercentile =
    mean(historicalPercentiles);


  // Use explicitly supplied candidate population when known.
  // Otherwise fall back to the latest historical year.

  const latestYear =
    [...yearlyData].sort(
      (a, b) => b.year - a.year
    )[0];

  const latestAppeared = Number(
    latestYear?.official?.appeared
  );

  const candidatePopulation =
    Number.isFinite(referenceAppeared) &&
    referenceAppeared > 0
      ? referenceAppeared
      : latestAppeared;


  const expectedRank =
    percentileToRank(
      expectedPercentile,
      candidatePopulation
    );


  // --------------------------------------------------------
  // HISTORICAL RANGE
  // --------------------------------------------------------
  //
  // Rather than inventing ±10% or ±20%, use the actual
  // historical percentile spread from contributing years.
  // --------------------------------------------------------

  const strongestHistoricalPercentile =
    Math.max(...historicalPercentiles);

  const weakestHistoricalPercentile =
    Math.min(...historicalPercentiles);

  const bestCase =
    percentileToRank(
      strongestHistoricalPercentile,
      candidatePopulation
    );

  const conservativeCase =
    percentileToRank(
      weakestHistoricalPercentile,
      candidatePopulation
    );


  const confidence =
    calculateConfidence(
      yearlyRankEstimates,
      totalYears
    );


  return {
    expectedRank,

    expectedPercentile:
      Number(
        expectedPercentile.toFixed(3)
      ),

    yearsUsed:
      yearlyRankEstimates.length,

    totalYears,

    yearlyRankEstimates,

    likelyRange: {
      bestCase,
      conservativeCase,
    },

    confidence,

    target,
  };
}


// ----------------------------------------------------------
// DISPLAY HELPER
// ----------------------------------------------------------

export function estimatePercentile(
  rank,
  appeared
) {
  const percentile =
    rankToPercentile(
      rank,
      appeared
    );

  return percentile === null
    ? null
    : Number(
        percentile.toFixed(2)
      );
}


// ----------------------------------------------------------
// GATE SCORE ESTIMATE
// ----------------------------------------------------------
//
// This remains separate from the historical AIR model.
//
// It requires the qualifying-marks and top-mean parameters
// supplied in gateCsData.js.
// ----------------------------------------------------------

export function calculateGateScore({
  marks,
  qualifyingMarks,
  topMeanMarks,
  qualifyingScore = 350,
  topScore = 900,
}) {
  const inputs = [
    marks,
    qualifyingMarks,
    topMeanMarks,
  ];

  if (
    inputs.some(
      (value) =>
        !Number.isFinite(value)
    )
  ) {
    return null;
  }

  if (
    topMeanMarks === qualifyingMarks
  ) {
    return null;
  }

  const calculatedScore =
    qualifyingScore +
    (topScore - qualifyingScore) *
      (
        (marks - qualifyingMarks) /
        (topMeanMarks - qualifyingMarks)
      );

  return Math.round(
    clamp(
      calculatedScore,
      0,
      1000
    )
  );
}