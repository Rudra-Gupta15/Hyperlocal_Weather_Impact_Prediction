# 🌦️ Hyperlocal Weather Impact Prediction System

<p align="center">
  <img src="https://img.shields.io/badge/ML-Regression-blue.svg" />
  <img src="https://img.shields.io/badge/Frontend-Interactive%20Dashboard-orange.svg" />
  <img src="https://img.shields.io/badge/Models-Random%20Forest%20|%20GB-green.svg" />
</p>

An end-to-end Machine Learning system that predicts weather-based heat stress and visualizes impact through a high-performance analytics dashboard. This project bridges the gap between raw ML metrics and user-centric data visualization.

---
## 🌦️ Live Demo

🔗 **[Click here to try the application](https://weather-app-15-henna.vercel.app/)**

## ✨ Features

* 🤖 **Multi-Model Pipeline:** Implements and compares Linear Regression, Random Forest, and Gradient Boosting.
* 📈 **Live Analytics Dashboard:** Interactive UI showing MAE, RMSE, and $R^2$ scores dynamically.
* ⚙️ **Feature Engineering:** Advanced preprocessing including lag features, rolling averages, and interaction terms.
* 📊 **Data Visualization:** Real-time comparison of "Predicted vs. Actual" values via a custom analytics modal.

---

## 📁 Project Structure

```bash
Hyperlocal_Weather_Impact_Prediction/
├── data/               # Raw and processed weather datasets
├── frontend/           # Dashboard UI (HTML, CSS, JS, Assets)
├── models/             # Trained .pkl files (RF, Linear, GB, Scaler)
├── results/            # Model performance metrics & JSON exports
├── main.py             # Core ML pipeline & training script
└── requirements.txt    # Project dependencies
