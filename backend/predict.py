import pickle
import pandas as pd
import numpy as np
import sys
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Model aur encoder load karo
with open(os.path.join(BASE_DIR, 'model', 'ipl_model.pkl'), 'rb') as f:
    model = pickle.load(f)

with open(os.path.join(BASE_DIR, 'model', 'encoder.pkl'), 'rb') as f:
    encoder = pickle.load(f)

# Match data load karo win rate calculate karne ke liye
df = pd.read_csv(os.path.join(BASE_DIR, 'data', 'ipl_matches_final.csv'))

def get_team_win_rate(team, df):
    past_matches = df[(df['team1'] == team) | (df['team2'] == team)]
    if len(past_matches) == 0:
        return 0.5
    wins = (past_matches['winner'] == team).sum()
    return wins / len(past_matches)

# Command line se arguments lo
team1 = sys.argv[1]
team2 = sys.argv[2]
venue = sys.argv[3]
toss_winner = sys.argv[4]
toss_decision = sys.argv[5]

# Win rates calculate karo
team1_win_rate = get_team_win_rate(team1, df)
team2_win_rate = get_team_win_rate(team2, df)

# Categorical features encode karo
cat_input = pd.DataFrame([[venue, toss_winner, toss_decision]],
                          columns=['venue', 'toss_winner', 'toss_decision'])
cat_encoded = encoder.transform(cat_input)

# Numerical + categorical combine karo
X_input = np.hstack([[[team1_win_rate, team2_win_rate]], cat_encoded])

# Prediction karo
probability = model.predict_proba(X_input)[0]

result = {
    "team1": team1,
    "team2": team2,
    "team1_win_probability": round(probability[1] * 100, 2),
    "team2_win_probability": round(probability[0] * 100, 2),
    "team1_win_rate_historical": round(team1_win_rate * 100, 2),
    "team2_win_rate_historical": round(team2_win_rate * 100, 2)
}

print(json.dumps(result))