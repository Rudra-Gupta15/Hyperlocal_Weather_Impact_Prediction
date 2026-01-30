"""
Weather Prediction ML System
Complete pipeline: Fetch → Process → Train → Evaluate → Export
"""

import os
import requests
import pandas as pd
import numpy as np
from datetime import datetime
from dotenv import load_dotenv
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import pickle
import matplotlib.pyplot as plt
import json

# Load API key
load_dotenv()
API_KEY = os.getenv('OPENWEATHER_API_KEY')
BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

# ============================================================================
# STEP 1: FETCH WEATHER DATA
# ============================================================================

def fetch_weather_data(n_samples=100):
    """Fetch or generate weather data"""
    print("📊 Creating weather dataset...")
    
    # For demo: use simulated data
    np.random.seed(42)
    
    data = {
        'timestamp': pd.date_range('2024-01-01', periods=n_samples, freq='h'),
        'temperature': np.random.normal(25, 5, n_samples),
        'humidity': np.random.uniform(30, 90, n_samples),
        'wind_speed': np.random.uniform(0, 15, n_samples),
        'pressure': np.random.normal(1013, 10, n_samples),
        'clouds': np.random.uniform(0, 100, n_samples),
        'rain': np.random.uniform(0, 5, n_samples),
        'feels_like': np.random.normal(24, 5, n_samples),
        'temp_max': np.random.normal(28, 5, n_samples),
        'temp_min': np.random.normal(20, 5, n_samples),
    }
    
    df = pd.DataFrame(data)
    print(f"✅ Dataset created: {len(df)} records")
    return df

# ============================================================================
# STEP 2: ENGINEER FEATURES
# ============================================================================

def engineer_features(df):
    """Create ML features"""
    print("\n🔧 Engineering features...")
    
    df = df.copy()
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    # TARGET: Heat Stress Index
    rh = df['humidity'] / 100.0
    es = 6.112 * np.exp((17.62 * df['temperature']) / (df['temperature'] + 243.12))
    e = rh * es
    df['heat_stress_index'] = df['temperature'] + 0.5555 * (e - 10)
    
    # LAG FEATURES
    for lag in [1, 3]:
        df[f'temp_lag_{lag}'] = df['temperature'].shift(lag)
        df[f'humidity_lag_{lag}'] = df['humidity'].shift(lag)
    
    # ROLLING AVERAGES
    df['temp_rolling_3h'] = df['temperature'].rolling(3).mean()
    df['humidity_rolling_3h'] = df['humidity'].rolling(3).mean()
    
    # INTERACTIONS
    df['temp_humidity_interaction'] = df['temperature'] * (df['humidity'] / 100)
    df['wind_temp_interaction'] = df['wind_speed'] * df['temperature']
    
    # TIME FEATURES
    df['hour'] = df['timestamp'].dt.hour
    df['month'] = df['timestamp'].dt.month
    
    # Remove NaN
    df = df.dropna()
    
    print(f"✅ Features created: {df.shape[1]} columns, {df.shape[0]} rows")
    return df

# ============================================================================
# STEP 3: PREPARE DATA
# ============================================================================

def prepare_ml_data(df_processed):
    """Split and scale data"""
    print("\n📊 Preparing ML data...")
    
    feature_cols = [
        'temperature', 'humidity', 'wind_speed', 'pressure', 'clouds', 'rain',
        'temp_lag_1', 'humidity_lag_1',
        'temp_rolling_3h', 'humidity_rolling_3h',
        'temp_humidity_interaction', 'wind_temp_interaction',
        'hour', 'month'
    ]
    
    X = df_processed[feature_cols]
    y = df_processed['heat_stress_index']
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print(f"✅ Train: {len(X_train)} | Test: {len(X_test)}")
    return X_train_scaled, X_test_scaled, X_train, X_test, y_train, y_test, scaler

# ============================================================================
# STEP 4: TRAIN MODELS
# ============================================================================

def train_models(X_train_scaled, X_train, y_train):
    """Train 3 models"""
    print("\n🚀 Training models...")
    
    models = {}
    
    # 1. Linear Regression
    print("  1️⃣ Linear Regression")
    lr = LinearRegression()
    lr.fit(X_train_scaled, y_train)
    models['linear'] = lr
    
    # 2. Random Forest
    print("  2️⃣ Random Forest")
    rf = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    models['random_forest'] = rf
    
    # 3. Gradient Boosting
    print("  3️⃣ Gradient Boosting")
    gb = GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42)
    gb.fit(X_train, y_train)
    models['gradient_boosting'] = gb
    
    print("✅ All models trained!")
    return models

# ============================================================================
# STEP 5: EVALUATE MODELS
# ============================================================================

def evaluate_models(models, X_test_scaled, X_test, y_test):
    """Evaluate all models"""
    print("\n📊 EVALUATION RESULTS")
    print("="*50)
    
    results = {}
    
    for name, model in models.items():
        # Predict
        if name == 'linear':
            y_pred = model.predict(X_test_scaled)
        else:
            y_pred = model.predict(X_test)
        
        # Metrics
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        results[name] = {'MAE': mae, 'RMSE': rmse, 'R2': r2, 'pred': y_pred}
        
        print(f"\n{name.upper()}")
        print(f"  MAE:  {mae:.4f}°C")
        print(f"  RMSE: {rmse:.4f}°C")
        print(f"  R²:   {r2:.4f}")
    
    print("\n" + "="*50)
    best = max(results, key=lambda x: results[x]['R2'])
    print(f"\n🏆 BEST: {best.upper()} (R² = {results[best]['R2']:.4f})")
    
    return results

# ============================================================================
# STEP 6: VISUALIZE
# ============================================================================

def visualize_results(results, y_test):
    """Create plots"""
    print("\n📈 Creating visualizations...")
    
    fig, axes = plt.subplots(1, 3, figsize=(15, 4))
    fig.suptitle('Model Predictions vs Actual', fontsize=14, fontweight='bold')
    
    for idx, (name, metrics) in enumerate(results.items()):
        ax = axes[idx]
        ax.scatter(y_test, metrics['pred'], alpha=0.6)
        ax.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
        ax.set_xlabel('Actual HSI')
        ax.set_ylabel('Predicted HSI')
        ax.set_title(f"{name}\nR² = {metrics['R2']:.4f}")
        ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('results/model_comparison.png', dpi=100)
    print("✅ Plot saved: results/model_comparison.png")

# ============================================================================
# STEP 7: SAVE MODELS
# ============================================================================

def save_models(models, scaler, df_processed):
    """Save everything"""
    print("\n💾 Saving models...")
    
    for name, model in models.items():
        path = f'models/{name}_model.pkl'
        with open(path, 'wb') as f:
            pickle.dump(model, f)
        print(f"  ✅ {name}_model.pkl")
    
    # Save scaler
    with open('models/scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    print(f"  ✅ scaler.pkl")
    
    # Save data
    df_processed.to_csv('data/weather_data_processed.csv', index=False)
    print(f"  ✅ weather_data_processed.csv")

# ============================================================================
# STEP 8: SAVE RESULTS AS JSON (NEW!)
# ============================================================================

def save_results_json(results):
    """Export model results to JSON for dashboard"""
    print("\n📄 Exporting results to JSON...")
    
    # Convert results to clean format
    output = {}
    for name, metrics in results.items():
        output[name] = {
            "MAE": round(metrics["MAE"], 3),
            "RMSE": round(metrics["RMSE"], 3),
            "R2": round(metrics["R2"], 4)
        }
    
    # Find best model
    best = max(output, key=lambda x: output[x]["R2"])
    
    # Create dashboard data structure
    dashboard_data = {
        "city": "Madrid",
        "temperature": 31,
        "condition": "Sunny",
        "best_model": best,
        "models": output
    }
    
    # Save to JSON file
    with open("results/dashboard_data.json", "w") as f:
        json.dump(dashboard_data, f, indent=4)
    
    print("✅ JSON exported: results/dashboard_data.json")

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🌤️  WEATHER PREDICTION ML SYSTEM")
    print("="*50 + "\n")
    
    # Create all directories first
    os.makedirs('data', exist_ok=True)
    os.makedirs('models', exist_ok=True)
    os.makedirs('results', exist_ok=True)
    
    # Step 1: Fetch
    df = fetch_weather_data(100)
    df.to_csv('data/weather_data.csv', index=False)
    
    # Step 2: Engineer
    df_processed = engineer_features(df)
    
    # Step 3: Prepare
    X_train_scaled, X_test_scaled, X_train, X_test, y_train, y_test, scaler = prepare_ml_data(df_processed)
    
    # Step 4: Train
    models = train_models(X_train_scaled, X_train, y_train)
    
    # Step 5: Evaluate
    results = evaluate_models(models, X_test_scaled, X_test, y_test)
    
    # Step 6: Visualize
    visualize_results(results, y_test)
    
    # Step 7: Save
    save_models(models, scaler, df_processed)
    
    # Step 8: Export JSON (NEW!)
    save_results_json(results)
    
    print("\n" + "="*50)
    print("✅ COMPLETE!")
    print("="*50 + "\n")
    print("📁 Files saved:")
    print("  - data/weather_data.csv")
    print("  - data/weather_data_processed.csv")
    print("  - models/*_model.pkl")
    print("  - results/model_comparison.png")
    print("  - results/dashboard_data.json  ← NEW!")
    print("\n🚀 Ready to push to GitHub!")