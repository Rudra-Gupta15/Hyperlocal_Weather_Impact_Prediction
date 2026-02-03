---
description: How to run the Weather ML Dashboard
---
1. **Generate ML Data**: Run the Python script to fetch weather data, train models, and export results.
   ```bash
   python main.py
   ```
2. **Start Local Server**: Start a simple HTTP server in the project root to serve both the frontend and results.
   ```bash
   python -m http.server 8000
   ```
3. **Open in Browser**: Navigate to the dashboard.
   ```
   http://localhost:8000/frontend/
   ```
