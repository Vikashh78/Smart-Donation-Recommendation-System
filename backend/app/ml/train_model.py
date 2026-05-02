import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

# urgency based dataset only
data = {
    "urgency": [1,2,3,4,1,2,3,4],
    "score":   [25,50,75,100,20,55,80,98]
}

df = pd.DataFrame(data)

X = df[["urgency"]]
y = df["score"]

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

joblib.dump(model, "app/ml/model.pkl")

print("Urgency Model Trained Successfully")