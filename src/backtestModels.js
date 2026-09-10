import { gateCsData } from "./data/gateCsData.js";
import {
  interpolateRankLog,
  median,
} from "./rankEngine.js";

/*
  GATE Rank Analyzer — model backtesting

  Strategy:
  ---------
  Hold one year out as the "unknown" test year.
  Use all remaining years as historical training years.

  For each actual marks↔AIR observation in the held-out year:
    1. Predict a rank from every training year whose marks range
       covers that score.
    2. Combine those predictions using different models.
    3. Compare predicted AIR against the real held-out AIR.

  We require at least 2 historical years to cover a test point.
*/

const MIN_TRAINING_YEARS = 2;

// ------------------------------------
// BASIC HELPERS
// ------------------------------------

function mean(values) {
  if (!values.length) return null;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function rankToPercentile(rank, appeared) {
  if (
    rank == null ||
    appeared == null ||
    appeared <= 0
  ) {
    return null;
  }

  return 100 * (1 - (rank - 1) / appeared);
}

function percentileToRank(percentileValue, appeared) {
  if (
    percentileValue == null ||
    appeared == null ||
    appeared <= 0
  ) {
    return null;
  }

  return Math.max(
    1,
    Math.round(
      1 +
        (1 - percentileValue / 100) *
          appeared
    )
  );
}

// ------------------------------------
// RECENCY WEIGHT
// ------------------------------------

/*
  This is only one candidate model.

  More recent years get larger weights:

  weight = 1 / age

  Example predicting 2025:
  2024 → 1
  2023 → 0.5
  2022 → 0.33
  2021 → 0.25

  Backtesting will tell us whether
  this performs better or worse.
*/

function recencyWeight(
  trainingYear,
  heldOutYear
) {
  const age = Math.abs(
    heldOutYear - trainingYear
  );

  return 1 / Math.max(1, age);
}

function weightedMean(
  items,
  valueKey,
  weightKey
) {
  const usable = items.filter(
    (item) =>
      Number.isFinite(item[valueKey]) &&
      Number.isFinite(item[weightKey]) &&
      item[weightKey] > 0
  );

  if (!usable.length) {
    return null;
  }

  const numerator = usable.reduce(
    (sum, item) =>
      sum +
      item[valueKey] *
        item[weightKey],
    0
  );

  const denominator = usable.reduce(
    (sum, item) =>
      sum + item[weightKey],
    0
  );

  return numerator / denominator;
}

// ------------------------------------
// GET HISTORICAL ESTIMATES
// ------------------------------------

function getHistoricalEstimates({
  marks,
  heldOutYear,
  trainingYears,
}) {
  return trainingYears
    .map((year) => {
      const rank = interpolateRankLog(
        year.rankData,
        marks
      );

      if (rank == null) {
        return null;
      }

      const appeared =
        year.official?.appeared;

      const percentileValue =
        rankToPercentile(
          rank,
          appeared
        );

      return {
        year: year.year,
        rank,
        appeared,
        percentile: percentileValue,

        recencyWeight:
          recencyWeight(
            year.year,
            heldOutYear
          ),
      };
    })
    .filter(Boolean);
}

// ------------------------------------
// CANDIDATE MODELS
// ------------------------------------

const MODELS = {
  mean_rank: {
    label: "Mean historical AIR",

    predict({ estimates }) {
      return Math.round(
        mean(
          estimates.map(
            (item) => item.rank
          )
        )
      );
    },
  },

  median_rank: {
    label: "Median historical AIR",

    predict({ estimates }) {
      return Math.round(
        median(
          estimates.map(
            (item) => item.rank
          )
        )
      );
    },
  },

  mean_percentile: {
    label:
      "Mean historical percentile",

    predict({
      estimates,
      heldOutAppeared,
    }) {
      const percentiles =
        estimates
          .map(
            (item) =>
              item.percentile
          )
          .filter(Number.isFinite);

      if (!percentiles.length) {
        return null;
      }

      return percentileToRank(
        mean(percentiles),
        heldOutAppeared
      );
    },
  },

  median_percentile: {
    label:
      "Median historical percentile",

    predict({
      estimates,
      heldOutAppeared,
    }) {
      const percentiles =
        estimates
          .map(
            (item) =>
              item.percentile
          )
          .filter(Number.isFinite);

      if (!percentiles.length) {
        return null;
      }

      return percentileToRank(
        median(percentiles),
        heldOutAppeared
      );
    },
  },

  recency_weighted_rank: {
    label:
      "Recency-weighted AIR",

    predict({ estimates }) {
      const value = weightedMean(
        estimates,
        "rank",
        "recencyWeight"
      );

      return value == null
        ? null
        : Math.round(value);
    },
  },

  recency_weighted_percentile: {
    label:
      "Recency-weighted percentile",

    predict({
      estimates,
      heldOutAppeared,
    }) {
      const value = weightedMean(
        estimates.filter(
          (item) =>
            Number.isFinite(
              item.percentile
            )
        ),
        "percentile",
        "recencyWeight"
      );

      if (value == null) {
        return null;
      }

      return percentileToRank(
        value,
        heldOutAppeared
      );
    },
  },
};

// ------------------------------------
// ERROR METRICS
// ------------------------------------

function calculateError(
  predictedRank,
  actualRank
) {
  const absoluteError = Math.abs(
    predictedRank - actualRank
  );

  const percentageError =
    actualRank === 0
      ? null
      : (absoluteError / actualRank) *
        100;

  /*
    Useful because rank spans huge ranges.

    Example:
    100 → 200
    1000 → 2000

    Both are 2x errors, and log error
    treats them similarly.
  */

  const logRankError = Math.abs(
    Math.log(
      predictedRank / actualRank
    )
  );

  return {
    absoluteError,
    percentageError,
    logRankError,
  };
}

function summarizeModel(rows) {
  if (!rows.length) {
    return {
      predictions: 0,
      mae: null,
      medianAbsoluteError: null,
      mape: null,
      meanLogRankError: null,
    };
  }

  const absoluteErrors =
    rows.map(
      (row) => row.absoluteError
    );

  const percentageErrors =
    rows
      .map(
        (row) =>
          row.percentageError
      )
      .filter(Number.isFinite);

  const logErrors =
    rows.map(
      (row) =>
        row.logRankError
    );

  return {
    predictions: rows.length,

    mae: Math.round(
      mean(absoluteErrors)
    ),

    medianAbsoluteError:
      Math.round(
        median(absoluteErrors)
      ),

    mape:
      percentageErrors.length
        ? Number(
            mean(
              percentageErrors
            ).toFixed(2)
          )
        : null,

    meanLogRankError:
      Number(
        mean(logErrors).toFixed(4)
      ),
  };
}

// ------------------------------------
// LEAVE-ONE-YEAR-OUT BACKTEST
// ------------------------------------

function runBacktest(yearlyData) {
  const resultsByModel =
    Object.fromEntries(
      Object.keys(MODELS).map(
        (key) => [key, []]
      )
    );

  const coverage = [];

  for (const heldOut of yearlyData) {
    const trainingYears =
      yearlyData.filter(
        (year) =>
          year.year !== heldOut.year
      );

    const heldOutAppeared =
      heldOut.official?.appeared;

    let usablePoints = 0;
    let skippedPoints = 0;

    for (const point of heldOut.rankData) {
      const estimates =
        getHistoricalEstimates({
          marks: point.marks,
          heldOutYear:
            heldOut.year,
          trainingYears,
        });

      if (
        estimates.length <
        MIN_TRAINING_YEARS
      ) {
        skippedPoints += 1;
        continue;
      }

      usablePoints += 1;

      for (const [
        modelKey,
        model,
      ] of Object.entries(
        MODELS
      )) {
        const predictedRank =
          model.predict({
            estimates,
            heldOutAppeared,
          });

        if (
          predictedRank == null ||
          !Number.isFinite(
            predictedRank
          ) ||
          predictedRank <= 0
        ) {
          continue;
        }

        const errors =
          calculateError(
            predictedRank,
            point.rank
          );

        resultsByModel[
          modelKey
        ].push({
          heldOutYear:
            heldOut.year,

          marks:
            point.marks,

          actualRank:
            point.rank,

          predictedRank,

          trainingYearsUsed:
            estimates.map(
              (item) =>
                item.year
            ),

          ...errors,
        });
      }
    }

    coverage.push({
      heldOutYear:
        heldOut.year,

      totalObservedPoints:
        heldOut.rankData.length,

      usablePoints,

      skippedPoints,
    });
  }

  return {
    resultsByModel,
    coverage,
  };
}

// ------------------------------------
// REPORTING
// ------------------------------------

function printCoverage(
  coverage
) {
  console.log(
    "\n=== BACKTEST COVERAGE ===\n"
  );

  console.table(
    coverage.map(
      (item) => ({
        Year:
          item.heldOutYear,

        "Observed points":
          item.totalObservedPoints,

        "Tested points":
          item.usablePoints,

        "Skipped points":
          item.skippedPoints,
      })
    )
  );
}

function printModelSummary(
  resultsByModel
) {
  const summaryRows =
    Object.entries(
      resultsByModel
    ).map(
      ([modelKey, rows]) => {
        const summary =
          summarizeModel(rows);

        return {
          Model:
            MODELS[modelKey]
              .label,

          Predictions:
            summary.predictions,

          MAE:
            summary.mae,

          "Median AE":
            summary
              .medianAbsoluteError,

          "MAPE %":
            summary.mape,

          "Mean log error":
            summary
              .meanLogRankError,
        };
      }
    );

  /*
    Sort by mean log error.

    Lower = better.
  */

  summaryRows.sort(
    (a, b) =>
      (
        a["Mean log error"] ??
        Infinity
      ) -
      (
        b["Mean log error"] ??
        Infinity
      )
  );

  console.log(
    "\n=== MODEL COMPARISON ===\n"
  );

  console.table(
    summaryRows
  );

  return summaryRows;
}

function printBestModelExamples(
  summaryRows,
  resultsByModel
) {
  if (!summaryRows.length) {
    return;
  }

  const winningLabel =
    summaryRows[0].Model;

  const winningEntry =
    Object.entries(
      MODELS
    ).find(
      ([, model]) =>
        model.label ===
        winningLabel
    );

  if (!winningEntry) {
    return;
  }

  const [winningKey] =
    winningEntry;

  const examples =
    resultsByModel[
      winningKey
    ]
      .slice()
      .sort(
        (a, b) =>
          a.logRankError -
          b.logRankError
      )
      .slice(0, 12);

  console.log(
    `\n=== SAMPLE PREDICTIONS: ${winningLabel} ===\n`
  );

  console.table(
    examples.map(
      (row) => ({
        "Held-out year":
          row.heldOutYear,

        Marks:
          row.marks,

        "Actual AIR":
          row.actualRank,

        "Predicted AIR":
          row.predictedRank,

        "Absolute error":
          row.absoluteError,

        "Training years":
          row
            .trainingYearsUsed
            .join(", "),
      })
    )
  );
}

// ------------------------------------
// RUN BACKTEST
// ------------------------------------

const {
  resultsByModel,
  coverage,
} = runBacktest(
  gateCsData
);

printCoverage(
  coverage
);

const summaryRows =
  printModelSummary(
    resultsByModel
  );

printBestModelExamples(
  summaryRows,
  resultsByModel
);

console.log(
  "\nInterpretation:"
);

console.log(
  "- Lower Mean log error is better."
);

console.log(
  "- Also compare MAE, Median AE, and MAPE before choosing the final model."
);

console.log(
  `- Every tested point required at least ${MIN_TRAINING_YEARS} historical years with verified marks coverage.`
);

console.log(
  "- If too many points are skipped, improve the historical dataset before trusting the result."
);