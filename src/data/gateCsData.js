/*
  GATE CS historical dataset.

  SOURCE POLICY
  -------------
  official:
  Values published by official GATE organizing institutes.

  rankData:
  Candidate-reported / published result observations.

  IMPORTANT:
  The prediction engine should only interpolate within the
  observed marks range available for a particular year.
*/

export const gateCsData = [
  {
    year: 2023,

    official: {
      appeared: 75679,
      qualifyingMarks: 32.5,
      topMeanMarks: 81.320526,
    },

    rankData: [
      { marks: 84.67, rank: 16 },
      { marks: 82.33, rank: 30 },
      { marks: 81.67, rank: 34 },
      { marks: 80.67, rank: 39 },
      { marks: 80.33, rank: 42 },
      { marks: 78.33, rank: 48 },
      { marks: 77.67, rank: 52 },
      { marks: 77.33, rank: 55 },
      { marks: 75.67, rank: 85 },
      { marks: 74.33, rank: 102 },
      { marks: 74.0, rank: 107 },
      { marks: 71.67, rank: 148 },
      { marks: 71.33, rank: 156 },
      { marks: 71.0, rank: 170 },
      { marks: 70.33, rank: 186 },
      { marks: 70.0, rank: 194 },
      { marks: 69.67, rank: 200 },
      { marks: 68.67, rank: 229 },
      { marks: 68.33, rank: 239 },
      { marks: 67.67, rank: 262 },
      { marks: 67.33, rank: 271 },
      { marks: 66.67, rank: 299 },
      { marks: 65.67, rank: 339 },
      { marks: 65.33, rank: 352 },
      { marks: 64.33, rank: 405 },
      { marks: 63.67, rank: 448 },
      { marks: 63.33, rank: 460 },
      { marks: 63.0, rank: 484 },
      { marks: 62.67, rank: 507 },
      { marks: 62.33, rank: 530 },
      { marks: 62.0, rank: 543 },
      { marks: 61.33, rank: 590 },
      { marks: 61.0, rank: 608 },
      { marks: 60.67, rank: 640 },
      { marks: 60.0, rank: 689 },
      { marks: 58.0, rank: 860 },
      { marks: 55.33, rank: 1169 },
      { marks: 52.67, rank: 1597 },
      { marks: 52.33, rank: 1646 },
      { marks: 50.0, rank: 2042 },
      { marks: 44.0, rank: 3547 },
      { marks: 41.0, rank: 4747 },
      { marks: 40.67, rank: 4909 },
      { marks: 38.67, rank: 5943 },
      { marks: 36.0, rank: 7600 },
    ],

    notes:
      "Broad candidate-reported marks-to-AIR coverage.",
  },

  {
    year: 2024,

    official: {
      appeared: 123967,
      qualifyingMarks: 27.6,

      // Leaving this null until we have a verified official value.
      topMeanMarks: null,
    },

    rankData: [
      { marks: 91.07, rank: 1 },
      { marks: 85.35, rank: 8 },
      { marks: 83.27, rank: 17 },
      { marks: 82.66, rank: 20 },
      { marks: 80.99, rank: 31 },
      { marks: 79.3, rank: 34 },
      { marks: 79.29, rank: 35 },
      { marks: 79.27, rank: 44 },
      { marks: 78.29, rank: 45 },
    ],

    notes:
      "Verified candidate-reported coverage currently concentrated at high ranks.",
  },

  {
    year: 2025,

    official: {
      appeared: 170825,
      qualifyingMarks: 29.2,
      topMeanMarks: 83.24,
    },

    rankData: [
      { marks: 88.06, rank: 20 },
      { marks: 84.66, rank: 56 },
      { marks: 83.39, rank: 70 },
      { marks: 82.54, rank: 83 },
      { marks: 74.79, rank: 289 },
      { marks: 60.06, rank: 1814 },
    ],

    notes:
      "Candidate-reported observations. Sparse compared with 2023.",
  },
];