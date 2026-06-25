import pickle
import pandas as pd
import numpy as np
import sys
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Final model aur encoder load karo
with open(os.path.join(BASE_DIR, 'model', 'ipl_model_final.pkl'), 'rb') as f:
    model = pickle.load(f)

with open(os.path.join(BASE_DIR, 'model', 'encoder_final.pkl'), 'rb') as f:
    encoder = pickle.load(f)

with open(os.path.join(BASE_DIR, 'model', 'df_for_predictions.pkl'), 'rb') as f:
    df = pickle.load(f)

# Rare venues grouping ke liye list bana lo
venue_counts = df['venue'].value_counts()
rare_venues = venue_counts[venue_counts < 20].index.tolist()

def group_venue(venue):
    return 'Other' if venue in rare_venues else venue

def get_team_win_rate(team, df):
    past_matches = df[(df['team1'] == team) | (df['team2'] == team)]
    if len(past_matches) == 0:
        return 0.5
    wins = (past_matches['winner'] == team).sum()
    return wins / len(past_matches)

def get_head_to_head(team1, team2, df):
    past_matches = df[((df['team1'] == team1) & (df['team2'] == team2)) |
                       ((df['team1'] == team2) & (df['team2'] == team1))]
    if len(past_matches) == 0:
        return 0.5
    team1_wins = (past_matches['winner'] == team1).sum()
    return team1_wins / len(past_matches)

# Command line se arguments lo
team1 = sys.argv[1]
team2 = sys.argv[2]
venue = sys.argv[3]
toss_winner = sys.argv[4]
toss_decision = sys.argv[5]

# Features calculate karo
team1_win_rate = get_team_win_rate(team1, df)
team2_win_rate = get_team_win_rate(team2, df)
h2h_rate = get_head_to_head(team1, team2, df)
venue_grouped = group_venue(venue)

# Categorical encode karo
cat_input = pd.DataFrame([[venue_grouped, toss_winner, toss_decision]],
                          columns=['venue_grouped', 'toss_winner', 'toss_decision'])
cat_encoded = encoder.transform(cat_input)

# Combine karo
X_input = np.hstack([[[team1_win_rate, team2_win_rate, h2h_rate]], cat_encoded])

# Prediction
probability = model.predict_proba(X_input)[0]

result = {
    "team1": team1,
    "team2": team2,
    "team1_win_probability": round(probability[1] * 100, 2),
    "team2_win_probability": round(probability[0] * 100, 2),
    "team1_win_rate_historical": round(team1_win_rate * 100, 2),
    "team2_win_rate_historical": round(team2_win_rate * 100, 2),
    "head_to_head": round(h2h_rate * 100, 2)
}

print(json.dumps(result))