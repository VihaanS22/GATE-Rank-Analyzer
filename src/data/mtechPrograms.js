// ==========================================================
// M.TECH PROGRAM DATA — CCMT
// ==========================================================
//
// IMPORTANT:
//
// 1. All cutoff values must come from official CCMT data.
// 2. GATE SCORE is used — not AIR.
// 3. Every observation stores its counselling round.
// 4. Regular Round 1 is the PRIMARY comparison dataset.
// 5. Later/Special/NSR rounds may eventually be shown
//    separately as "later-round possibilities".
// 6. IITs are NOT stored here. IIT admissions will use a
//    separate COAP / institute-specific dataset.
// ==========================================================


// ----------------------------------------------------------
// VERIFIED PROGRAM DATA
// ----------------------------------------------------------
//
// This remains empty until actual CCMT rows are imported.
//
// Example structure:
//
// {
//   id: "nit-warangal-cse",
//
//   institute:
//     "National Institute of Technology Warangal",
//
//   shortName: "NIT Warangal",
//
//   instituteType: "NIT",
//
//   department:
//     "Computer Science and Engineering",
//
//   program:
//     "M.Tech Computer Science and Engineering",
//
//   admissionRoute: "CCMT",
//
//   acceptedGatePapers: ["CS"],
//
//   cutoffs: {
//
//     OPEN: [
//       {
//         year: 2025,
//         round: "REGULAR_1",
//         minScore: 000,
//         maxScore: 000,
//         source: "Official CCMT"
//       }
//     ],
//
//     OPEN_EWS: [],
//     OBC_NCL: [],
//     SC: [],
//     ST: [],
//     PWD: []
//   }
// }
//
// IMPORTANT:
// 000 above is SCHEMA ONLY.
// Never put placeholder zero values into production data.
// ----------------------------------------------------------

export const mtechPrograms = [
  // ========================================================
  // NIT WARANGAL
  // CCMT 2024 — Regular Round 1
  // ========================================================

  {
    id: "nit-warangal-cse",

    institute:
      "National Institute of Technology Warangal",

    shortName: "NIT Warangal",

    instituteType: "NIT",

    department:
      "Computer Science and Engineering",

    program:
      "M.Tech Computer Science & Engineering",

    admissionRoute: "CCMT",

    acceptedGatePapers: ["CS"],

    cutoffs: {
      OPEN: [
        {
          year: 2024,
          round: "REGULAR_1",
          minScore: 751,
          maxScore: 785,
          source: "CCMT 2024",
        },
      ],

      OPEN_EWS: [
        {
          year: 2024,
          round: "REGULAR_1",
          minScore: 738,
          maxScore: 744,
          source: "CCMT 2024",
        },
      ],

      OBC_NCL: [
        {
          year: 2024,
          round: "REGULAR_1",
          minScore: 720,
          maxScore: 729,
          source: "CCMT 2024",
        },
      ],

      SC: [
        {
          year: 2024,
          round: "REGULAR_1",
          minScore: 542,
          maxScore: 613,
          source: "CCMT 2024",
        },
      ],

      ST: [
        {
          year: 2024,
          round: "REGULAR_1",
          minScore: 447,
          maxScore: 472,
          source: "CCMT 2024",
        },
      ],

      PWD: [],
    },

    source: {
      type: "CCMT",
      years: [2024],
      primaryRound: "REGULAR_1",
    },
  },


  // ========================================================
  // NIT SURATHKAL
  // CCMT 2024 — Regular Round 1
  // ========================================================

  {
    id: "nit-surathkal-cse",

    institute:
      "National Institute of Technology Karnataka, Surathkal",

    shortName: "NIT Surathkal",

    instituteType: "NIT",

    department:
      "Computer Science and Engineering",

    program:
      "M.Tech Computer Science & Engineering",

    admissionRoute: "CCMT",

    acceptedGatePapers: ["CS"],

    cutoffs: {
      OPEN: [
        {
          year: 2024,
          round: "REGULAR_1",
          minScore: 742,
          maxScore: 765,
          source: "CCMT 2024",
        },
      ],

      // Category-specific Round-1 observations will be
      // added only after individual verification.
      OPEN_EWS: [],
      OBC_NCL: [],
      SC: [],
      ST: [],
      PWD: [],
    },

    source: {
      type: "CCMT",
      years: [2024],
      primaryRound: "REGULAR_1",
    },
  },


  // ========================================================
  // NIT TIRUCHIRAPPALLI — GROUP 1
  // CCMT 2024 — Regular Round 1
  // ========================================================

  {
    id: "nit-trichy-cse-g1",

    institute:
      "National Institute of Technology, Tiruchirappalli",

    shortName: "NIT Trichy",

    instituteType: "NIT",

    department:
      "Computer Science and Engineering",

    program:
      "M.Tech Computer Science & Engineering — Group 1",

    admissionRoute: "CCMT",

    acceptedGatePapers: ["CS"],

    cutoffs: {
      OPEN: [
        {
          year: 2024,
          round: "REGULAR_1",
          minScore: 765,
          maxScore: 797,
          source: "CCMT 2024",
        },
      ],

      OPEN_EWS: [],
      OBC_NCL: [],
      SC: [],
      ST: [],
      PWD: [],
    },

    source: {
      type: "CCMT",
      years: [2024],
      primaryRound: "REGULAR_1",
    },
  },


  // ========================================================
  // NIT TIRUCHIRAPPALLI — GROUP 2
  // CCMT 2024 — Regular Round 1
  // ========================================================

  {
    id: "nit-trichy-cse-g2",

    institute:
      "National Institute of Technology, Tiruchirappalli",

    shortName: "NIT Trichy",

    instituteType: "NIT",

    department:
      "Computer Science and Engineering",

    program:
      "M.Tech Computer Science & Engineering — Group 2",

    admissionRoute: "CCMT",

    acceptedGatePapers: ["CS"],

    cutoffs: {
      OPEN: [
        {
          year: 2024,
          round: "REGULAR_1",
          minScore: 749,
          maxScore: 804,
          source: "CCMT 2024",
        },
      ],

      OPEN_EWS: [],
      OBC_NCL: [],
      SC: [],
      ST: [],
      PWD: [],
    },

    source: {
      type: "CCMT",
      years: [2024],
      primaryRound: "REGULAR_1",
    },
  },


  // ========================================================
  // NIT DELHI
  // CCMT 2024 — Regular Round 1
  // ========================================================

  {
    id: "nit-delhi-cse",

    institute:
      "National Institute of Technology Delhi",

    shortName: "NIT Delhi",

    instituteType: "NIT",

    department:
      "Computer Science and Engineering",

    program:
      "M.Tech Computer Science & Engineering",

    admissionRoute: "CCMT",

    acceptedGatePapers: ["CS"],

    cutoffs: {
      OPEN: [
        {
          year: 2024,
          round: "REGULAR_1",
          minScore: 680,
          maxScore: 751,
          source: "CCMT 2024",
        },
      ],

      OPEN_EWS: [],
      OBC_NCL: [],
      SC: [],
      ST: [],
      PWD: [],
    },

    source: {
      type: "CCMT",
      years: [2024],
      primaryRound: "REGULAR_1",
    },
  },


  // ========================================================
  // NIT SILCHAR
  // CCMT 2024 — Regular Round 1
  // ========================================================

  {
    id: "nit-silchar-cse",

    institute:
      "National Institute of Technology, Silchar",

    shortName: "NIT Silchar",

    instituteType: "NIT",

    department:
      "Computer Science and Engineering",

    program:
      "M.Tech Computer Science & Engineering",

    admissionRoute: "CCMT",

    acceptedGatePapers: ["CS"],

    cutoffs: {
      OPEN: [
        {
          year: 2024,
          round: "REGULAR_1",
          minScore: 570,
          maxScore: 668,
          source: "CCMT 2024",
        },
      ],

      OPEN_EWS: [],
      OBC_NCL: [],
      SC: [],
      ST: [],
      PWD: [],
    },

    source: {
      type: "CCMT",
      years: [2024],
      primaryRound: "REGULAR_1",
    },
  },
];


// ----------------------------------------------------------
// CATEGORIES
// ----------------------------------------------------------

export const MTECH_CATEGORIES = [
  {
    value: "OPEN",
    label: "General / Open",
  },

  {
    value: "OPEN_EWS",
    label: "EWS",
  },

  {
    value: "OBC_NCL",
    label: "OBC-NCL",
  },

  {
    value: "SC",
    label: "SC",
  },

  {
    value: "ST",
    label: "ST",
  },

  {
    value: "PWD",
    label: "PwD",
  },
];


// ----------------------------------------------------------
// COUNSELLING ROUNDS
// ----------------------------------------------------------

export const CCMT_ROUNDS = {
  REGULAR_1: {
    label: "Regular Round 1",
    type: "REGULAR",
    primary: true,
  },

  REGULAR_2: {
    label: "Regular Round 2",
    type: "REGULAR",
    primary: false,
  },

  REGULAR_3: {
    label: "Regular Round 3",
    type: "REGULAR",
    primary: false,
  },

  SPECIAL_1: {
    label: "Special Round 1",
    type: "SPECIAL",
    primary: false,
  },

  SPECIAL_2: {
    label: "Special Round 2",
    type: "SPECIAL",
    primary: false,
  },

  NSR: {
    label: "National Spot Round",
    type: "SPOT",
    primary: false,
  },
};


// ----------------------------------------------------------
// ADMISSION ROUTES
// ----------------------------------------------------------

export const ADMISSION_ROUTES = {
  CCMT: {
    label: "CCMT",

    instituteTypes: [
      "NIT",
      "IIIT",
      "IIEST",
      "CFTI",
    ],

    metric: "GATE_SCORE",
  },

  COAP: {
    label: "COAP / Institute",

    instituteTypes: ["IIT"],

    metric: "INSTITUTE_SPECIFIC",
  },
};


// ----------------------------------------------------------
// DATA INFORMATION
// ----------------------------------------------------------

export const mtechDataInfo = {
  exam: "GATE",

  level: "M.Tech",

  primaryGatePaper: "CS",

  metric: "GATE Score",

  sourceType: "Official CCMT",

  recommendationYears: [
    2023,
    2024,
    2025,
    2026,
  ],

  primaryRound: "REGULAR_1",

  availableOfficialSessions: [
    2021,
    2022,
    2023,
    2024,
    2025,
    2026,
  ],

  recommendationDisclaimer:
    "Historical cutoff comparisons do not guarantee admission. Eligibility, qualifying degree, GATE paper mapping, category, seat availability and counselling round rules also apply.",
};