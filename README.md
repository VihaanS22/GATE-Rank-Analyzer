# 🎯 GATE Rank Analyzer

## Data-Driven GATE CS Rank Estimation & Performance Analysis

Developed by Vihaan ©

(Note that only GATE CSE estimation is available now. Further course analysis are under development)
GATE Rank Analyzer is an interactive web application that estimates a candidate's possible **GATE Computer Science All India Rank (AIR)** using historical marks-versus-rank data.

Instead of using a fixed marks-to-rank formula, the application analyzes previous GATE CS trends to provide a more realistic estimate.

---

## How the App Works

The user enters:

- GATE CS marks
- Target All India Rank

The application compares the entered marks with historical GATE CS data from **2023–2025**.

The analysis follows:

**Marks → Historical Data → Rank Estimation → Rank Range → Target Analysis**

Because the relationship between marks and AIR is nonlinear, the application uses **log-rank interpolation** between known historical data points rather than simple linear estimation.

---

## Features

### 🎯 Expected AIR
Estimates the candidate's likely All India Rank based on historical marks-to-rank patterns.

### 📊 Likely Rank Range
Instead of giving only one predicted rank, the app provides:

- Best-case AIR
- Expected AIR
- Conservative AIR

This accounts for variation between different GATE years.

### 📅 Year-Wise Analysis
Shows how the same marks could have resulted in different ranks across **2023, 2024 and 2025**.

### 🥅 Target AIR
Users can enter a desired AIR and see the approximate marks required to reach that target based on historical data.

### 📈 Estimated Percentile
Uses the estimated AIR and candidate-count data to calculate an approximate percentile.

### 🧮 Estimated GATE Score
Provides an estimated GATE score using available qualifying and performance reference values.

### 🧪 Model Backtesting
Historical years can be held out and predicted using the remaining data, allowing the estimation method to be compared against known results.

### 🚫 Controlled Predictions
The analyzer avoids blindly extrapolating beyond historical ranges where the available data cannot reasonably support a prediction.

---

## Analysis Flow

```text
GATE CS Marks
      ↓
Historical Marks ↔ AIR Data
      ↓
Log-Rank Interpolation
      ↓
Year-Wise Estimates
      ↓
Expected AIR
      ↓
Best / Expected / Conservative Range
      ↓
Percentile + GATE Score
      ↓
Target AIR Analysis
