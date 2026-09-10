import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Database,
  LineChart,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  analyzeRank,
  calculateGateScore,
  estimatePercentile,
} from "./rankEngine";

import { gateCsData } from "./data/gateCsData";

import {
  mtechPrograms,
  MTECH_CATEGORIES,
} from "./data/mtechPrograms";

import {
  recommendMTechPrograms,
  groupRecommendations,
} from "./collegeEngine";


function App() {
  // ========================================================
  // FORM STATE
  // ========================================================

  const [marks, setMarks] = useState("");
  const [targetRank, setTargetRank] = useState("");

  const [submittedMarks, setSubmittedMarks] =
    useState(null);

  const [
    submittedTargetRank,
    setSubmittedTargetRank,
  ] = useState(null);

  const [formError, setFormError] =
    useState("");

  // M.Tech admission category
  const [category, setCategory] =
    useState("OPEN");


  // ========================================================
  // NUMERIC VALUES
  // ========================================================

  const numericMarks =
    submittedMarks !== null
      ? Number(submittedMarks)
      : null;

  const numericTargetRank =
    submittedTargetRank !== null
      ? Number(submittedTargetRank)
      : null;


  // ========================================================
  // RANK ANALYSIS
  // ========================================================

  const analysis = useMemo(() => {
    if (
      numericMarks === null ||
      numericTargetRank === null
    ) {
      return null;
    }

    return analyzeRank({
      marks: numericMarks,
      targetRank: numericTargetRank,
      yearlyData: gateCsData,
    });
  }, [
    numericMarks,
    numericTargetRank,
  ]);


  // ========================================================
  // LATEST HISTORICAL YEAR
  // ========================================================

  const latestYear =
    gateCsData[gateCsData.length - 1];


  // ========================================================
  // ESTIMATED GATE SCORE
  // ========================================================

  const gateScore =
    numericMarks !== null
      ? calculateGateScore({
          marks: numericMarks,

          qualifyingMarks:
            latestYear.official
              .qualifyingMarks,

          topMeanMarks:
            latestYear.official
              .topMeanMarks,
        })
      : null;


  // ========================================================
  // M.TECH RECOMMENDATIONS
  // ========================================================

  const mtechRecommendations =
    useMemo(() => {
      if (
        gateScore === null ||
        !category ||
        mtechPrograms.length === 0
      ) {
        return [];
      }

      return recommendMTechPrograms({
        gateScore,
        category,
        gatePaper: "CS",
        programs: mtechPrograms,
      });
    }, [gateScore, category]);


  const groupedMtechRecommendations =
    useMemo(
      () =>
        groupRecommendations(
          mtechRecommendations
        ),
      [mtechRecommendations]
    );


  // ========================================================
  // DISPLAY PERCENTILE
  // ========================================================

  const estimatedPercentile =
    analysis?.expectedRank !== null &&
    analysis?.expectedRank !== undefined
      ? estimatePercentile(
          analysis.expectedRank,
          latestYear.official.appeared
        )
      : null;


  const bestCase =
    analysis?.likelyRange.bestCase ??
    null;

  const conservativeCase =
    analysis?.likelyRange
      .conservativeCase ?? null;


  // ========================================================
  // ANALYZE BUTTON
  // ========================================================

  const handleAnalyze = () => {
    const parsedMarks = Number(marks);
    const parsedTarget =
      Number(targetRank);

    if (
      marks === "" ||
      targetRank === ""
    ) {
      setFormError(
        "Enter both your marks and target AIR."
      );

      return;
    }

    if (
      Number.isNaN(parsedMarks) ||
      parsedMarks < 0 ||
      parsedMarks > 100
    ) {
      setFormError(
        "Marks must be between 0 and 100."
      );

      return;
    }

    if (
      Number.isNaN(parsedTarget) ||
      parsedTarget < 1 ||
      !Number.isInteger(parsedTarget)
    ) {
      setFormError(
        "Target AIR must be a whole number greater than 0."
      );

      return;
    }

    setFormError("");

    setSubmittedMarks(parsedMarks);

    setSubmittedTargetRank(
      parsedTarget
    );

    setTimeout(() => {
      document
        .getElementById("results")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };


  // ========================================================
  // PAGE
  // ========================================================

  return (
    <div className="site-shell">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-mark">
            G
          </div>

          <div>
            <strong>GATE</strong>
            <span>RANK ANALYZER</span>
          </div>

        </div>

        <div className="paper-pill">
          CS
        </div>

      </header>


      <main>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="hero">

          <div className="hero-copy">

            <div className="eyebrow">

              <Sparkles size={15} />

              DATA-DRIVEN GATE INSIGHTS

            </div>


            <h1>
              More than a rank.

              <span>
                A smarter path forward.
              </span>
            </h1>


            <p>
              Analyze your GATE CS
              performance with historical
              data, understand where you
              stand, and see what it may
              take to reach your target.
            </p>


            <div className="hero-points">

              <Feature
                icon={Database}
                text="Historical Data"
              />

              <Feature
                icon={Target}
                text="Target Planning"
              />

              <Feature
                icon={TrendingUp}
                text="Rank Insights"
              />

            </div>

          </div>


          <div
            className="hero-visual"
            aria-hidden="true"
          >

            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <div className="glow-dot dot-one" />
            <div className="glow-dot dot-two" />
            <div className="glow-dot dot-three" />


            <div className="visual-card">

              <span>
                YOUR GOAL
              </span>

              <strong>
                AIR{" "}
                {submittedTargetRank ||
                  "—"}
              </strong>

              <small>
                Plan. Improve. Progress.
              </small>

            </div>

          </div>

        </section>


        {/* =================================================
            ANALYZER
        ================================================= */}

        <section
          className="analyzer-panel"
          id="analyzer"
        >

          <div className="field">

            <label>
              GATE Paper
            </label>

            <select
              value="CS"
              disabled
            >
              <option value="CS">
                Computer Science (CS)
              </option>
            </select>

          </div>


          <div className="field">

            <label>
              Your Marks
            </label>

            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={marks}
              placeholder="e.g. 62"

              onChange={(event) => {
                setMarks(
                  event.target.value
                );

                setFormError("");
              }}
            />

          </div>


          <div className="field">

            <label>
              Target AIR
            </label>

            <input
              type="number"
              min="1"
              value={targetRank}
              placeholder="e.g. 500"

              onChange={(event) => {
                setTargetRank(
                  event.target.value
                );

                setFormError("");
              }}
            />

          </div>


          <button
            className="analyze-button"
            type="button"
            onClick={handleAnalyze}
          >

            Analyze My Rank

            <ArrowRight size={18} />

          </button>

        </section>


        {formError && (
          <p className="form-error">
            {formError}
          </p>
        )}


        {/* =================================================
            RESULTS
        ================================================= */}

        {analysis && (
          <>

            <section
              className="metrics"
              id="results"
            >

              <MetricCard
                className="mint"
                icon={BarChart3}
                label="Expected AIR"

                value={
                  analysis.expectedRank !==
                  null
                    ? `~${analysis.expectedRank.toLocaleString(
                        "en-IN"
                      )}`
                    : "—"
                }

                note={`Based on ${
                  analysis.yearsUsed
                } historical ${
                  analysis.yearsUsed === 1
                    ? "year"
                    : "years"
                }`}
              />


              <MetricCard
                className="violet"
                icon={LineChart}
                label="Likely Rank Range"

                value={
                  bestCase !== null &&
                  conservativeCase !==
                    null
                    ? `${bestCase.toLocaleString(
                        "en-IN"
                      )} – ${conservativeCase.toLocaleString(
                        "en-IN"
                      )}`
                    : "—"
                }

                note="Best-case to conservative historical band"
              />


              <MetricCard
                className="blue"
                icon={TrendingUp}
                label="Estimated Percentile"

                value={
                  estimatedPercentile !==
                  null
                    ? `${estimatedPercentile}%`
                    : "—"
                }

                note="Estimated relative position"
              />


              <MetricCard
                className="yellow"
                icon={Target}
                label="Estimated GATE Score"

                value={
                  gateScore !== null
                    ? gateScore
                    : "—"
                }

                note="Used later for M.Tech comparisons"
              />

            </section>


            {/* =============================================
                TARGET ANALYSIS
            ============================================= */}

            <section className="content-grid">

              <div className="insight-card">

                <div className="card-label">
                  TARGET ANALYSIS
                </div>

                <h2>
                  AIR{" "}
                  {submittedTargetRank?.toLocaleString(
                    "en-IN"
                  )}
                </h2>


                {analysis.target
                  .expectedMarks !==
                null ? (
                  <>

                    <p>
                      Historical data
                      suggests approximately
                      <strong>
                        {" "}
                        {
                          analysis.target
                            .expectedMarks
                        }{" "}
                        marks
                      </strong>{" "}
                      for your target AIR.
                    </p>


                    <div className="target-stat">

                      <span>
                        MARKS GAP
                      </span>

                      <strong>
                        {analysis.target
                          .marksGap > 0
                          ? "+"
                          : ""}

                        {
                          analysis.target
                            .marksGap
                        }
                      </strong>

                    </div>


                    <small>
                      Based on{" "}
                      {
                        analysis.target
                          .yearsUsed
                      }{" "}
                      usable historical{" "}
                      {analysis.target
                        .yearsUsed === 1
                        ? "year"
                        : "years"}
                      .
                    </small>

                  </>
                ) : (
                  <p>
                    There is not enough
                    verified historical
                    coverage to estimate the
                    marks required for this
                    target AIR.
                  </p>
                )}

              </div>


              <div className="insight-card">

                <div className="card-label">
                  WHAT THIS MEANS
                </div>

                <h2>
                  Read the range, not just
                  one number.
                </h2>

                <p>
                  GATE difficulty and
                  candidate distributions
                  change every year. The
                  historical range provides
                  useful context around the
                  expected AIR instead of
                  pretending one estimate is
                  exact.
                </p>

              </div>


              <div className="quote-card">

                <div className="quote-glow" />

                <p>
                  Better data.
                  <br />
                  Better decisions.
                </p>

                <span>
                  Built for focused
                  learners.
                </span>

              </div>

            </section>


            {/* =============================================
                PREDICTION QUALITY
            ============================================= */}

            <section className="model-section">

              <div className="section-heading">

                <span>
                  PREDICTION QUALITY
                </span>

                <h2>
                  How strong is this
                  estimate?
                </h2>

                <p>
                  See exactly how much
                  historical data supports
                  your prediction and how
                  the model arrived at the
                  result.
                </p>

              </div>


              <div className="quality-grid">

                <div className="quality-card">

                  <span>
                    HISTORICAL SUPPORT
                  </span>

                  <strong>
                    {analysis.yearsUsed} /{" "}
                    {analysis.totalYears}
                  </strong>

                  <p>
                    historical years
                    contributed to this
                    prediction
                  </p>

                </div>


                <div className="quality-card">

                  <span>
                    MODEL
                  </span>

                  <strong className="quality-text">
                    Percentile-normalized
                  </strong>

                  <p>
                    Historical AIRs are
                    normalized for candidate
                    population before being
                    combined.
                  </p>

                </div>


                <div className="quality-card">

                  <span>
                    DATA SUPPORT
                  </span>

                  <strong
                    className={`confidence confidence-${analysis.confidence.level.toLowerCase()}`}
                  >
                    {
                      analysis.confidence
                        .level
                    }
                  </strong>

                  <p>
                    {
                      analysis.confidence
                        .reason
                    }
                  </p>

                </div>


                <div className="quality-card">

                  <span>
                    ESTIMATED PERCENTILE
                  </span>

                  <strong>
                    {analysis.expectedPercentile !==
                    null
                      ? `${analysis.expectedPercentile}%`
                      : "—"}
                  </strong>

                  <p>
                    Combined relative
                    position across usable
                    historical years
                  </p>

                </div>

              </div>


              <div className="explanation-card">

                <div className="explanation-number">
                  01
                </div>

                <div>

                  <h3>
                    Your marks are compared
                    year by year
                  </h3>

                  <p>
                    We estimate the
                    historical AIR
                    corresponding to your
                    marks separately for
                    every year that has
                    verified data around
                    your score.
                  </p>

                </div>


                <div className="explanation-number">
                  02
                </div>

                <div>

                  <h3>
                    AIR is normalized across
                    years
                  </h3>

                  <p>
                    Candidate populations
                    change between GATE
                    years, so historical
                    AIRs are converted into
                    relative percentile
                    positions before they
                    are combined.
                  </p>

                </div>


                <div className="explanation-number">
                  03
                </div>

                <div>

                  <h3>
                    Unsupported years are
                    excluded
                  </h3>

                  <p>
                    The analyzer does not
                    extrapolate beyond the
                    verified marks range
                    available for a
                    historical year.
                  </p>

                </div>

              </div>

            </section>


            {/* =============================================
                HISTORICAL COMPARISON
            ============================================= */}

            <section className="history-section">

              <div className="section-heading">

                <span>
                  HISTORICAL COMPARISON
                </span>

                <h2>
                  Your marks across previous
                  GATE years
                </h2>

                <p>
                  See how the same marks
                  would have translated into
                  AIR under different
                  historical result
                  distributions.
                </p>

              </div>


              <div className="history-table">

                <div className="history-header">

                  <span>YEAR</span>
                  <span>DATA RANGE</span>
                  <span>
                    HISTORICAL AIR
                  </span>
                  <span>STATUS</span>

                </div>


                {gateCsData.map((year) => {

                  const result =
                    analysis.yearlyRankEstimates.find(
                      (item) =>
                        item.year ===
                        year.year
                    );


                  const marksValues =
                    year.rankData.map(
                      (point) =>
                        point.marks
                    );


                  const minimumMarks =
                    Math.min(
                      ...marksValues
                    );


                  const maximumMarks =
                    Math.max(
                      ...marksValues
                    );


                  return (
                    <div
                      className="history-row"
                      key={year.year}
                    >

                      <strong>
                        {year.year}
                      </strong>


                      <span>
                        {minimumMarks} –{" "}
                        {maximumMarks}
                      </span>


                      <strong>
                        {result
                          ? `~${result.rank.toLocaleString(
                              "en-IN"
                            )}`
                          : "—"}
                      </strong>


                      <span
                        className={
                          result
                            ? "history-status used"
                            : "history-status excluded"
                        }
                      >

                        {result
                          ? "Included"
                          : "Not enough data"}

                      </span>

                    </div>
                  );
                })}

              </div>


              <div className="transparency-note">

                <strong>
                  Why might a year be
                  missing?
                </strong>

                <p>
                  A year is excluded when
                  your marks fall outside
                  the verified marks-to-AIR
                  observations available
                  for that year. We prefer
                  showing less data over
                  inventing an extrapolated
                  rank.
                </p>

              </div>

            </section>


            {/* =============================================
                M.TECH ADMISSION PLANNER
            ============================================= */}

            <section className="mtech-section">

              <div className="section-heading">

                <span>
                  M.TECH ADMISSION PLANNER
                </span>

                <h2>
                  Where could your GATE
                  score take you?
                </h2>

                <p>
                  Compare your estimated
                  GATE score with historical
                  M.Tech admission cutoffs
                  for CS-related programs.
                </p>

              </div>


              <div className="mtech-profile">

                <div className="mtech-score-box">

                  <span>
                    YOUR ESTIMATED GATE SCORE
                  </span>

                  <strong>
                    {gateScore !== null
                      ? gateScore
                      : "—"}
                  </strong>

                  <small>
                    Used for M.Tech program
                    comparison
                  </small>

                </div>


                <div className="mtech-category-box">

                  <label htmlFor="mtech-category">
                    Admission Category
                  </label>

                  <select
                    id="mtech-category"
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value
                      )
                    }
                  >

                    {MTECH_CATEGORIES.map(
                      (item) => (
                        <option
                          key={item.value}
                          value={
                            item.value
                          }
                        >
                          {item.label}
                        </option>
                      )
                    )}

                  </select>

                  <small>
                    Recommendations use
                    category-specific
                    historical cutoffs.
                  </small>

                </div>

              </div>


              {/* NO VERIFIED DATA YET */}

              {mtechPrograms.length ===
              0 ? (

                <div className="mtech-data-notice">

                  <span>
                    DATASET STATUS
                  </span>

                  <h3>
                    M.Tech recommendation
                    data is being verified.
                  </h3>

                  <p>
                    The recommendation
                    engine is ready, but
                    program recommendations
                    are hidden until
                    verified historical
                    CCMT cutoff data is
                    loaded. No college
                    cutoffs are estimated or
                    fabricated.
                  </p>

                </div>

              ) : mtechRecommendations.length ===
                0 ? (

                <div className="mtech-data-notice">

                  <span>
                    NO MATCHING PROGRAMS
                  </span>

                  <h3>
                    No verified programs
                    matched this profile.
                  </h3>

                  <p>
                    This may happen when
                    category-specific
                    historical cutoff data
                    or CS-paper eligibility
                    is unavailable.
                  </p>

                </div>

              ) : (

                <div className="recommendation-groups">

                  <RecommendationGroup
                    title="Safer"
                    description="Your estimated score is above the upper part of this program's historical cutoff range."
                    recommendations={
                      groupedMtechRecommendations.Safer
                    }
                  />


                  <RecommendationGroup
                    title="Competitive"
                    description="Your estimated score is at or above the historical median cutoff."
                    recommendations={
                      groupedMtechRecommendations.Competitive
                    }
                  />


                  <RecommendationGroup
                    title="Ambitious"
                    description="Your score falls within the lower part of the historical cutoff distribution."
                    recommendations={
                      groupedMtechRecommendations.Ambitious
                    }
                  />


                  <RecommendationGroup
                    title="Reach"
                    description="Your estimated score is below most recent historical cutoffs."
                    recommendations={
                      groupedMtechRecommendations.Reach
                    }
                  />

                </div>
              )}


              <div className="mtech-disclaimer">

                <strong>
                  Important
                </strong>

                <p>
                  These are historical
                  M.Tech admission
                  comparisons, not admission
                  guarantees. Actual
                  eligibility and allotment
                  can depend on qualifying
                  degree, GATE paper,
                  category, seat
                  availability and
                  counselling rules.
                </p>

              </div>

            </section>


            {/* =============================================
                DATA COVERAGE
            ============================================= */}

            <section className="coverage-strip">

              <div>

                <span>
                  DATA COVERAGE
                </span>

                <strong>
                  {gateCsData[0]?.year} –{" "}
                  {
                    gateCsData[
                      gateCsData.length - 1
                    ]?.year
                  }{" "}
                  GATE CS
                </strong>

              </div>


              <div>

                <span>
                  MODEL
                </span>

                <strong>
                  Historical percentile
                  normalization
                </strong>

              </div>


              <div>

                <span>
                  EXTRAPOLATION
                </span>

                <strong>
                  Disabled
                </strong>

              </div>

            </section>

          </>
        )}

      </main>

    </div>
  );
}


// ==========================================================
// SMALL UI COMPONENTS
// ==========================================================

function Feature({
  icon: Icon,
  text,
}) {
  return (
    <div className="feature">

      <Icon size={16} />

      <span>
        {text}
      </span>

    </div>
  );
}


function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  className = "",
}) {
  return (
    <div
      className={`metric-card ${className}`}
    >

      <div className="metric-icon">
        <Icon size={19} />
      </div>

      <span className="metric-label">
        {label}
      </span>

      <strong className="metric-value">
        {value}
      </strong>

      <small>
        {note}
      </small>

    </div>
  );
}


// ==========================================================
// M.TECH RECOMMENDATION GROUP
// ==========================================================

function RecommendationGroup({
  title,
  description,
  recommendations,
}) {
  if (!recommendations?.length) {
    return null;
  }

  return (
    <div className="recommendation-group">

      <div className="recommendation-group-heading">

        <div>

          <span
            className={`recommendation-dot ${title.toLowerCase()}`}
          />

          <strong>
            {title}
          </strong>

        </div>


        <span>

          {recommendations.length}{" "}

          {recommendations.length === 1
            ? "program"
            : "programs"}

        </span>

      </div>


      <p>
        {description}
      </p>


      <div className="program-grid">

        {recommendations.map(
          (item) => (

            <MTechProgramCard
              key={item.id}
              item={item}
            />

          )
        )}

      </div>

    </div>
  );
}


// ==========================================================
// M.TECH PROGRAM CARD
// ==========================================================

function MTechProgramCard({
  item,
}) {
  return (
    <article className="program-card">

      <div className="program-card-top">

        <span>
          {item.instituteType}
        </span>

        <span
          className={`program-status ${item.status.toLowerCase()}`}
        >
          {item.status}
        </span>

      </div>


      <h3>
        {item.institute}
      </h3>


      <p className="program-name">
        {item.program}
      </p>


      <div className="program-stats">

        <div>

          <span>
            HISTORICAL MEDIAN
          </span>

          <strong>
            {item.cutoffStats.median}
          </strong>

        </div>


        <div>

          <span>
            YOUR SCORE
          </span>

          <strong>
            {item.gateScore}
          </strong>

        </div>


        <div>

          <span>
            SCORE GAP
          </span>

          <strong>

            {item.scoreGap >= 0
              ? "+"
              : ""}

            {item.scoreGap}

          </strong>

        </div>

      </div>


      <div className="program-history">

        <span>

          {item.cutoffStats.yearsUsed}{" "}

          historical{" "}

          {item.cutoffStats.yearsUsed ===
          1
            ? "year"
            : "years"}

        </span>


        <span>
          {item.admissionRoute}
        </span>

      </div>


      <p className="program-explanation">
        {item.explanation}
      </p>

    </article>
  );
}


export default App;