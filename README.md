# 🏏 IPL Win Predictor

A machine learning project that predicts IPL match outcomes using Logistic Regression, trained on 1187 historical matches (2008-2026).

🔗 **Live Demo:** https://ipl-win-predictor-3e7f.onrender.com

## Overview

This project predicts the probability of either team winning an IPL match based on historical team performance, head-to-head record, venue, and toss details. Unlike a rule-based system, this uses an actual trained classification model — with full transparency about its accuracy and limitations.

## Features

- 🏏 Select Team 1, Team 2, Venue, Toss Winner and Toss Decision
- 📊 Get win probability for both teams
- 📈 View historical win rate and head-to-head record
- 🌓 Dark/Light theme toggle
- ✅ Input validation (can't select the same team twice)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| ML Engine | Python, Pandas, Scikit-learn |
| Model | Logistic Regression |
| Deployment | Render.com |

## How It Works

1. User selects two teams, venue, toss winner, and toss decision
2. Frontend sends a POST request to the Node.js backend
3. Node.js spawns a Python process that:
   - Calculates each team's historical win rate (using only matches before the prediction date, to avoid data leakage)
   - Calculates head-to-head win rate between the two specific teams
   - One-Hot Encodes venue, toss winner, and toss decision
   - Loads the pre-trained Logistic Regression model and predicts win probability
4. Result (probabilities + historical stats) is returned as JSON and rendered on the frontend

## Model Development Journey

This project was built iteratively, with each version improving on the last:

| Version | Features Used | Accuracy |
|---|---|---|
| v1 | Raw team names + venue + toss | 48.74% |
| v2 | Only historical win rate | 50.84% |
| v3 | Win rate + venue + toss | 53.36% |
| v4 | + Head-to-head record | 53.78% |
| v5 | + Grouped rare venues (fixed overfitting) | 55.04% (single split) |

**Cross-validated accuracy: ~50.37%** (± 3.20%) — this is the more honest metric, since a single train-test split can be misleadingly optimistic.

## Key Learnings

- **Random Forest performed worse (47.06%)** than Logistic Regression — proving model complexity doesn't guarantee better results when feature signal is limited
- **Rare venues caused overfitting:** Venues with only 7-8 matches showed the highest feature importance — a classic small-sample-size problem, fixed by grouping rare venues into an "Other" category
- **Cross-validation matters:** Relying on a single train-test split gave an overly optimistic 55% accuracy; 5-fold cross-validation revealed the true average is closer to 50%
- **T20 cricket is inherently unpredictable** — even professional analytics systems (like CricViz) typically don't exceed 65-70% accuracy

## Data Cleaning

- Standardized renamed teams (e.g., Delhi Daredevils → Delhi Capitals, Kings XI Punjab → Punjab Kings)
- Removed 25 "No Result" (rain-abandoned) matches
- Merged duplicate venue names caused by inconsistent formatting (e.g., "Wankhede Stadium" vs "Wankhede Stadium, Mumbai")

## Data Source

[Kaggle — IPL Complete Dataset (2008-2026)](https://www.kaggle.com)

## Project Structure
cet-pravesh-ai/

├── backend/

│   ├── server.js          # Express API

│   └── recommend.py       # Recommendation engine

├── frontend/

│   ├── index.html

│   ├── css/style.css

│   └── js/app.js

├── data/

│   └── colleges.csv

└── notebooks/             # Data cleaning/exploration notebooks

## Future Scope

- Player-level statistics (batting/bowling form of playing XI)
- Live ball-by-ball win probability using delivery-level data
- ColumnTransformer + ML Pipeline for production-grade code
- Compare against Gradient Boosting (XGBoost)

## Author

Suhani — 3rd Year BE Computer Engineering, VCET Vasai