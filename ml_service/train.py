import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib
from datetime import datetime

# Set dummy data for training
def generate_dummy_data(n_samples=1000):
    np.random.seed(42)
    
    # Random dates in the past year
    dates = pd.date_range(end=datetime.now(), periods=n_samples)
    
    # Location coordinates roughly in Madurai (Latitude: ~9.9, Longitude: ~78.1)
    lats = np.random.uniform(9.85, 9.95, n_samples)
    lons = np.random.uniform(78.05, 78.15, n_samples)
    
    # Complaint count (0 to 50)
    complaints = np.random.randint(0, 50, n_samples)
    
    # Features for model: day of week and month
    day_of_week = dates.dayofweek
    month = dates.month
    
    # Target: Hotspot risk score (0 to 100)
    # Synthetic formula for demonstration
    risk_score = (complaints * 1.5) + ((day_of_week == 5) | (day_of_week == 6)) * 10 + np.random.normal(0, 5, n_samples)
    risk_score = np.clip(risk_score, 0, 100)
    
    df = pd.DataFrame({
        'latitude': lats,
        'longitude': lons,
        'complaint_count': complaints,
        'day_of_week': day_of_week,
        'month': month,
        'risk_score': risk_score
    })
    
    return df

def train_model():
    print("Generating training data...")
    df = generate_dummy_data()
    
    print("Preparing features and target...")
    X = df[['latitude', 'longitude', 'complaint_count', 'day_of_week', 'month']]
    y = df['risk_score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest model...")
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    print(f"Model RMSE: {rmse:.2f}")
    
    # Ensure models directory exists
    os.makedirs('models', exist_ok=True)
    
    model_path = 'models/hotspot_model.pkl'
    print(f"Saving model to {model_path}...")
    joblib.dump(model, model_path)
    print("Training complete!")

if __name__ == "__main__":
    train_model()
