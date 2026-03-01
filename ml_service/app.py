from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime
import pandas as pd
import joblib
import os
import uvicorn
from contextlib import asynccontextmanager

# Load model globally
MODEL_PATH = "models/hotspot_model.pkl"
model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"Model loaded from {MODEL_PATH}")
    else:
        print(f"Warning: Model not found at {MODEL_PATH}. Prediction endpoints might fail until model is trained.")
    yield
    # Clean up resources if needed
    model = None

app = FastAPI(
    title="CleanPulse Hotspot Prediction API",
    description="API for predicting waste hotspot risk scores",
    version="1.0.0",
    lifespan=lifespan
)

class PredictionRequest(BaseModel):
    latitude: float = Field(..., description="Latitude of the location", example=9.9252)
    longitude: float = Field(..., description="Longitude of the location", example=78.1198)
    complaint_count: int = Field(..., description="Number of recent complaints in the area", example=15)
    date: str = Field(..., description="Date for prediction (YYYY-MM-DD)", example="2026-02-28")

class PredictionResponse(BaseModel):
    risk_score: float = Field(..., description="Predicted hotspot risk score (0-100)")
    risk_level: str = Field(..., description="Risk category (Low, Medium, High)")

def get_risk_level(score: float) -> str:
    if score < 30:
        return "Low"
    elif score < 70:
        return "Medium"
    else:
        return "High"

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict", response_model=PredictionResponse)
def predict_hotspot(request: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded. Please train the model first.")
    
    try:
        # Parse date
        target_date = datetime.strptime(request.date, "%Y-%m-%d")
        
        # Prepare features DataFrame to match training data
        features = pd.DataFrame([{
            'latitude': request.latitude,
            'longitude': request.longitude,
            'complaint_count': request.complaint_count,
            'day_of_week': target_date.weekday(),
            'month': target_date.month
        }])
        
        # Predict risk score
        prediction = model.predict(features)[0]
        
        # Ensure score is within bounds [0, 100]
        score = max(0.0, min(100.0, float(prediction)))
        level = get_risk_level(score)
        
        return PredictionResponse(
            risk_score=round(score, 2),
            risk_level=level
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format or value error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
