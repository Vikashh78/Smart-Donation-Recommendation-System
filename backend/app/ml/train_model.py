"""
Smart Donation ML Model — Priority Scoring Engine
==================================================

WHAT THIS MODEL DOES:
---------------------
This model predicts a "priority score" (0–100) for each hospital resource request.
The score answers: "How urgently does this request need to be fulfilled?"

Higher score = match this request FIRST with available donations.

HOW IT WORKS (Plain English):
------------------------------
1. A hospital posts: "Need 10 oxygen concentrators, HIGH urgency, deadline: today"
2. We extract features: urgency level, quantity, deadline tightness, item category
3. Our Random Forest model (100 decision trees) votes on a priority score
4. The system matches highest-scored requests with available donors first

WHY RANDOM FOREST?
-------------------
- Handles non-linear relationships (urgency+deadline together matter more than either alone)
- Robust to outliers (one extreme value won't break it)
- Interpretable via feature importance
- Works well on small medical datasets without overfitting

FEATURE ENGINEERING:
---------------------
- urgency_score: critical=4, high=3, medium=2, low=1
- deadline_hours: 2h=2, today=8, 1day=24, 3days=72 (tighter = more urgent)
- quantity_normalized: 0–1 scale (larger requests = higher score)
- item_category: medical_equipment=3, consumables=2, medication=2, support=1
- days_since_posted: older unresolved requests get boosted
- combined_urgency: urgency × deadline_tightness interaction term
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import json
import os

# ============================================================
# SYNTHETIC MEDICAL DONATION DATASET
# Inspired by real medical supply chain patterns
# Features derived from WHO emergency supply protocols
# ============================================================

np.random.seed(42)
N = 2000  # samples

# === Generate realistic medical donation request data ===

urgency_levels = ['low', 'medium', 'high', 'critical']
urgency_weights = [0.15, 0.35, 0.35, 0.15]

deadline_options = ['2 hours', 'today', '1 day', '3 days']
deadline_weights = [0.10, 0.35, 0.35, 0.20]

item_categories = {
    'Oxygen Concentrator':     ('medical_equipment', 3),
    'Ventilator':              ('medical_equipment', 3),
    'ICU Bed':                 ('medical_equipment', 3),
    'Defibrillator':           ('medical_equipment', 3),
    'Surgical Gloves':         ('consumables', 2),
    'N95 Masks':               ('consumables', 2),
    'Syringes':                ('consumables', 2),
    'IV Drip Set':             ('consumables', 2),
    'Blood Pressure Monitor':  ('diagnostic', 2),
    'Glucometer':              ('diagnostic', 2),
    'Insulin':                 ('medication', 2),
    'Antibiotics':             ('medication', 2),
    'Paracetamol':             ('medication', 1),
    'Saline Solution':         ('consumables', 2),
    'Wheelchair':              ('support', 1),
    'Crutches':                ('support', 1),
}

items = list(item_categories.keys())

urgency_arr  = np.random.choice(urgency_levels, N, p=urgency_weights)
deadline_arr = np.random.choice(deadline_options, N, p=deadline_weights)
item_arr     = np.random.choice(items, N)

quantities = []
for item in item_arr:
    cat = item_categories[item][0]
    if cat == 'consumables':
        quantities.append(np.random.randint(10, 500))
    elif cat == 'medical_equipment':
        quantities.append(np.random.randint(1, 20))
    elif cat == 'medication':
        quantities.append(np.random.randint(5, 200))
    else:
        quantities.append(np.random.randint(1, 10))

days_posted = np.random.randint(0, 7, N)

df = pd.DataFrame({
    'urgency':       urgency_arr,
    'deadline':      deadline_arr,
    'item':          item_arr,
    'quantity':      quantities,
    'days_posted':   days_posted,
})

# === Feature Engineering ===

urgency_map = {'low': 1, 'medium': 2, 'high': 3, 'critical': 4}
deadline_map = {'2 hours': 2, 'today': 8, '1 day': 24, '3 days': 72}

df['urgency_score'] = df['urgency'].map(urgency_map)
df['deadline_hours'] = df['deadline'].map(deadline_map)
df['deadline_tightness'] = 72 / df['deadline_hours']  # inverse: tighter deadline = higher

df['item_category'] = df['item'].map(lambda x: item_categories[x][0])
df['item_priority']  = df['item'].map(lambda x: item_categories[x][1])

cat_map = {'medical_equipment': 3, 'consumables': 2, 'medication': 2, 'diagnostic': 2, 'support': 1}
df['category_score'] = df['item_category'].map(cat_map)

df['quantity_norm'] = np.minimum(np.log1p(df['quantity']) / 6.5, 1.0)

# Key interaction term: urgency × deadline pressure
df['urgency_deadline_interaction'] = df['urgency_score'] * df['deadline_tightness']

# Staleness boost: unresolved old requests get priority
df['staleness_boost'] = np.where(df['days_posted'] > 3, 1.5, 1.0)

# === Target: Priority Score (0–100) ===
# Engineered label that reflects real triage logic

base_score = (
    df['urgency_score'] * 20           # 0–80 from urgency
    + df['deadline_tightness'] * 6     # tighter deadline adds up
    + df['category_score'] * 4         # item criticality
    + df['quantity_norm'] * 8          # larger requests matter
    + df['days_posted'] * 1.5          # staleness adds urgency
    + df['urgency_deadline_interaction'] * 1.2  # interaction boosts
)

# Clip and normalize to 0–100
score_min, score_max = base_score.min(), base_score.max()
priority_score = 5 + 90 * (base_score - score_min) / (score_max - score_min)
priority_score += np.random.normal(0, 2, N)  # small noise for realism
df['priority_score'] = np.clip(priority_score, 0, 100)

# === Model Training ===

feature_cols = [
    'urgency_score',
    'deadline_tightness',
    'category_score',
    'item_priority',
    'quantity_norm',
    'urgency_deadline_interaction',
    'staleness_boost',
    'days_posted',
]

X = df[feature_cols]
y = df['priority_score']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Random Forest Model
rf_model = RandomForestRegressor(
    n_estimators=150,
    max_depth=8,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
rf_model.fit(X_train, y_train)

y_pred = rf_model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2   = r2_score(y_test, y_pred)

cv_scores = cross_val_score(rf_model, X, y, cv=5, scoring='r2')

# Feature importances
importances = dict(zip(feature_cols, rf_model.feature_importances_.round(4)))
sorted_imp = dict(sorted(importances.items(), key=lambda x: x[1], reverse=True))

# Save model + metadata
base_dir = os.path.dirname(os.path.abspath(__file__))
model_dir = base_dir
os.makedirs(model_dir, exist_ok=True)
model_path = os.path.join(model_dir, 'model.pkl')
metadata_path = os.path.join(model_dir, 'model_metadata.json')
joblib.dump(rf_model, model_path)

metadata = {
    "model_type": "RandomForestRegressor",
    "n_estimators": 150,
    "training_samples": len(X_train),
    "test_rmse": round(rmse, 3),
    "test_r2": round(r2, 3),
    "cv_r2_mean": round(cv_scores.mean(), 3),
    "cv_r2_std": round(cv_scores.std(), 3),
    "feature_importances": sorted_imp,
    "features": feature_cols,
    "urgency_map": urgency_map,
    "deadline_map": deadline_map,
    "item_categories": {k: v[0] for k, v in item_categories.items()},
}
with open(metadata_path, 'w') as f:
    json.dump(metadata, f, indent=2)

print("=" * 60)
print("SMART DONATION ML MODEL — TRAINING COMPLETE")
print("=" * 60)
print(f"Training samples  : {len(X_train)}")
print(f"Test samples      : {len(X_test)}")
print(f"Test RMSE         : {rmse:.2f} points (out of 100)")
print(f"Test R²           : {r2:.4f}  ({r2*100:.1f}% variance explained)")
print(f"Cross-val R²      : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
print()
print("FEATURE IMPORTANCES (what matters most):")
for feat, imp in sorted_imp.items():
    bar = '█' * int(imp * 50)
    print(f"  {feat:<35} {imp:.4f}  {bar}")
print()
print("Model saved to: app/ml/model.pkl")
print("Metadata saved to: app/ml/model_metadata.json")