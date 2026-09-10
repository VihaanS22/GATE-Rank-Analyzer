// ==========================================================
// GATE M.TECH COLLEGE RECOMMENDATION ENGINE
// ==========================================================
//
// For CCMT-based M.Tech recommendations.
//
// Uses:
// - Estimated GATE Score
// - Admission category
// - Accepted GATE paper
// - Historical minimum GATE scores
// - Consistent counselling round (Regular Round 1)
//
// IMPORTANT:
// "Safer" does NOT mean guaranteed admission.
// It describes historical cutoff position only.
//
// RULE:
// A program can only receive "Safer" classification when
// at least 3 verified historical years are available.
// ==========================================================


// ----------------------------------------------------------
// HELPERS
// ----------------------------------------------------------

function median(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 !== 0) {
    return sorted[middle];
  }

  return (
    sorted[middle - 1] +
    sorted[middle]
  ) / 2;
}


function percentile(values, p) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);

  const index =
    (sorted.length - 1) * p;

  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  return (
    sorted[lower] +
    (sorted[upper] - sorted[lower]) *
      (index - lower)
  );
}


// ----------------------------------------------------------
// CATEGORY NORMALIZATION
// ----------------------------------------------------------

export function normalizeCategory(category) {
  const categoryMap = {
    GENERAL: "OPEN",
    GEN: "OPEN",
    OPEN: "OPEN",

    EWS: "OPEN_EWS",
    OPEN_EWS: "OPEN_EWS",

    OBC: "OBC_NCL",
    OBC_NCL: "OBC_NCL",

    SC: "SC",
    ST: "ST",

    PWD: "PWD",
    PWBD: "PWD",
  };

  return categoryMap[category] ?? category;
}


// ----------------------------------------------------------
// HISTORICAL CUTOFF ANALYSIS
// ----------------------------------------------------------
//
// IMPORTANT:
//
// Only Regular Round 1 observations are used in the
// primary recommendation model.
//
// This prevents comparisons such as:
//
// 2023 Regular Round 1
// + 2024 Special Round
// + 2025 Spot Round
//
// which would not be comparable admission conditions.
// ----------------------------------------------------------

export function analyzeProgramCutoffs(cutoffs) {
  if (!Array.isArray(cutoffs)) {
    return null;
  }

  const usableCutoffs = cutoffs
    .filter((item) => {
      const score =
        Number(item.minScore);

      return (
        Number.isFinite(score) &&
        score > 0 &&
        item.round === "REGULAR_1"
      );
    })
    .sort(
      (a, b) => a.year - b.year
    );

  if (usableCutoffs.length === 0) {
    return null;
  }

  const scores =
    usableCutoffs.map(
      (item) =>
        Number(item.minScore)
    );

  const medianScore =
    median(scores);

  const p25Score =
    percentile(scores, 0.25);

  const p75Score =
    percentile(scores, 0.75);

  return {
    yearsUsed:
      usableCutoffs.length,

    years:
      usableCutoffs.map(
        (item) => item.year
      ),

    minimum:
      Math.min(...scores),

    maximum:
      Math.max(...scores),

    median:
      Math.round(medianScore),

    p25:
      Math.round(p25Score),

    p75:
      Math.round(p75Score),

    historical:
      usableCutoffs,

    evidenceLevel:
      getEvidenceLevel(
        usableCutoffs.length
      ),
  };
}


// ----------------------------------------------------------
// DATA EVIDENCE LEVEL
// ----------------------------------------------------------
//
// This is separate from admission classification.
//
// 1 year  → Limited
// 2 years → Developing
// 3 years → Moderate
// 4+      → Strong
// ----------------------------------------------------------

export function getEvidenceLevel(yearsUsed) {
  if (yearsUsed >= 4) {
    return "Strong";
  }

  if (yearsUsed === 3) {
    return "Moderate";
  }

  if (yearsUsed === 2) {
    return "Developing";
  }

  return "Limited";
}


// ----------------------------------------------------------
// CLASSIFY PROGRAM
// ----------------------------------------------------------
//
// Safer:
// Requires at least 3 historical years AND score >= p75.
//
// Competitive:
// Score >= historical median.
//
// Ambitious:
// Score >= historical p25.
//
// Reach:
// Score below historical p25.
//
// With only one historical year:
//
// score >= cutoff → Competitive
// score < cutoff  → Reach
//
// We intentionally DO NOT claim "Safer" from one year's
// cutoff.
// ----------------------------------------------------------

export function classifyMTechProgram(
  userScore,
  cutoffStats
) {
  if (
    !Number.isFinite(userScore) ||
    !cutoffStats
  ) {
    return "Insufficient data";
  }

  // "Safer" requires enough historical evidence.
  if (
    cutoffStats.yearsUsed >= 3 &&
    userScore >= cutoffStats.p75
  ) {
    return "Safer";
  }

  if (
    userScore >= cutoffStats.median
  ) {
    return "Competitive";
  }

  /*
    Ambitious only becomes meaningful when there is
    more than one historical observation.

    With one year, p25 = median = p75, so calling
    something "Ambitious" based on quartiles would
    create fake precision.
  */

  if (
    cutoffStats.yearsUsed >= 2 &&
    userScore >= cutoffStats.p25
  ) {
    return "Ambitious";
  }

  return "Reach";
}


// ----------------------------------------------------------
// RECOMMENDATION EXPLANATION
// ----------------------------------------------------------

export function getRecommendationExplanation(
  status,
  cutoffStats
) {
  const years =
    cutoffStats?.yearsUsed ?? 0;

  switch (status) {
    case "Safer":
      return (
        `Your estimated GATE score is above the upper ` +
        `part of this program's historical Round 1 cutoff ` +
        `distribution across ${years} verified years.`
      );

    case "Competitive":
      if (years === 1) {
        return (
          "Your estimated GATE score meets or exceeds " +
          "the verified Regular Round 1 cutoff available " +
          "for this program. Only one historical year is " +
          "currently available, so this should be treated " +
          "as limited evidence."
        );
      }

      return (
        "Your estimated GATE score is at or above the " +
        "historical median Regular Round 1 cutoff for " +
        "this program."
      );

    case "Ambitious":
      return (
        "Your estimated GATE score falls within the lower " +
        "part of this program's historical Regular Round 1 " +
        "cutoff distribution."
      );

    case "Reach":
      if (years === 1) {
        return (
          "Your estimated GATE score is below the verified " +
          "Regular Round 1 cutoff currently available for " +
          "this program. Later-round outcomes may differ."
        );
      }

      return (
        "Your estimated GATE score is below most of the " +
        "recent Regular Round 1 historical cutoffs for " +
        "this program."
      );

    default:
      return (
        "There is not enough verified historical cutoff " +
        "data to classify this program."
      );
  }
}


// ----------------------------------------------------------
// GATE PAPER CHECK
// ----------------------------------------------------------

function acceptsGatePaper(
  program,
  gatePaper
) {
  if (
    !Array.isArray(
      program.acceptedGatePapers
    )
  ) {
    return false;
  }

  return (
    program.acceptedGatePapers.includes(
      gatePaper
    )
  );
}


// ----------------------------------------------------------
// ANALYZE ONE PROGRAM
// ----------------------------------------------------------

export function analyzeMTechProgram({
  program,
  gateScore,
  category,
}) {
  if (
    !program ||
    !Number.isFinite(gateScore)
  ) {
    return null;
  }

  const normalizedCategory =
    normalizeCategory(category);

  const categoryCutoffs =
    program.cutoffs?.[
      normalizedCategory
    ];

  if (
    !Array.isArray(categoryCutoffs) ||
    categoryCutoffs.length === 0
  ) {
    return null;
  }

  const cutoffStats =
    analyzeProgramCutoffs(
      categoryCutoffs
    );

  if (!cutoffStats) {
    return null;
  }

  const status =
    classifyMTechProgram(
      gateScore,
      cutoffStats
    );

  const scoreGap =
    Math.round(
      gateScore -
      cutoffStats.median
    );

  return {
    id:
      program.id,

    institute:
      program.institute,

    shortName:
      program.shortName ??
      program.institute,

    instituteType:
      program.instituteType,

    department:
      program.department,

    program:
      program.program,

    admissionRoute:
      program.admissionRoute,

    acceptedGatePapers:
      program.acceptedGatePapers,

    category:
      normalizedCategory,

    gateScore,

    status,

    explanation:
      getRecommendationExplanation(
        status,
        cutoffStats
      ),

    cutoffStats,

    scoreGap,

    evidenceLevel:
      cutoffStats.evidenceLevel,

    source:
      program.source,
  };
}


// ----------------------------------------------------------
// SORTING PRIORITY
// ----------------------------------------------------------

const STATUS_PRIORITY = {
  Safer: 1,
  Competitive: 2,
  Ambitious: 3,
  Reach: 4,
  "Insufficient data": 5,
};


// ----------------------------------------------------------
// MAIN RECOMMENDATION ENGINE
// ----------------------------------------------------------

export function recommendMTechPrograms({
  gateScore,
  category,
  gatePaper = "CS",
  programs,
}) {
  if (
    !Number.isFinite(gateScore) ||
    !category ||
    !Array.isArray(programs)
  ) {
    return [];
  }

  return programs

    // CCMT institutions only.
    .filter(
      (program) =>
        program.admissionRoute ===
        "CCMT"
    )

    // Program must accept the selected GATE paper.
    .filter(
      (program) =>
        acceptsGatePaper(
          program,
          gatePaper
        )
    )

    // Analyze category-specific historical data.
    .map(
      (program) =>
        analyzeMTechProgram({
          program,
          gateScore,
          category,
        })
    )

    // Remove programs without usable category data.
    .filter(Boolean)

    // Sort into useful recommendation order.
    .sort((a, b) => {
      const priorityDifference =
        STATUS_PRIORITY[a.status] -
        STATUS_PRIORITY[b.status];

      if (
        priorityDifference !== 0
      ) {
        return priorityDifference;
      }

      /*
        Within the same recommendation band,
        historically more competitive programs
        appear first.
      */

      return (
        b.cutoffStats.median -
        a.cutoffStats.median
      );
    });
}


// ----------------------------------------------------------
// GROUP RECOMMENDATIONS FOR UI
// ----------------------------------------------------------

export function groupRecommendations(
  recommendations
) {
  const groups = {
    Safer: [],
    Competitive: [],
    Ambitious: [],
    Reach: [],
  };

  if (
    !Array.isArray(
      recommendations
    )
  ) {
    return groups;
  }

  recommendations.forEach(
    (recommendation) => {
      const group =
        groups[
          recommendation.status
        ];

      if (group) {
        group.push(
          recommendation
        );
      }
    }
  );

  return groups;
}


// ----------------------------------------------------------
// RECOMMENDATION SUMMARY
// ----------------------------------------------------------

export function summarizeRecommendations(
  recommendations
) {
  const grouped =
    groupRecommendations(
      recommendations
    );

  return {
    total:
      Array.isArray(
        recommendations
      )
        ? recommendations.length
        : 0,

    safer:
      grouped.Safer.length,

    competitive:
      grouped.Competitive.length,

    ambitious:
      grouped.Ambitious.length,

    reach:
      grouped.Reach.length,
  };
}