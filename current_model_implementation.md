# GeNe Mobile - Model Inference Implementation

## Overview

The GeNe mobile app integrates with a FastAPI backend to perform stress prediction using physiological data collected from wearable sensors or manual input.

## Data Collection

### Input Fields (21 parameters)

The stress prediction model requires 21 physiological parameters organized into categories:

#### Heart Rate Metrics
| Field | Type | Description |
|-------|------|-------------|
| `hr_mean` | number | Mean heart rate (bpm) |
| `hr_std` | number | Standard deviation of heart rate |
| `hr_min` | number | Minimum heart rate |
| `hr_max` | number | Maximum heart rate |

#### HRV (Heart Rate Variability) - RMSSD
| Field | Type | Description |
|-------|------|-------------|
| `rmssd_mean` | number | Mean RMSSD (ms) |
| `rmssd_std` | number | Standard deviation of RMSSD |
| `rmssd_min` | number | Minimum RMSSD |
| `rmssd_max` | number | Maximum RMSSD |

#### Frequency Domain
| Field | Type | Description |
|-------|------|-------------|
| `lf_hf_ratio` | number | Low-frequency to High-frequency ratio |

#### Activity Metrics
| Field | Type | Description |
|-------|------|-------------|
| `activity_steps` | number | Number of steps |
| `activity_calories` | number | Calories burned |
| `activity_level` | number | Activity level (0-1) |

#### Temperature Metrics
| Field | Type | Description |
|-------|------|-------------|
| `temp_mean` | number | Mean temperature (°C) |
| `temp_std` | number | Standard deviation of temperature |
| `temp_range` | number | Temperature range |

#### EDA (Electrodermal Activity) Metrics
| Field | Type | Description |
|-------|------|-------------|
| `eda_scl_mean` | number | Mean SCL (Skin Conductance Level) |
| `eda_scl_std` | number | Standard deviation of SCL |
| `eda_scr_count` | number | Number of SCR (Skin Conductance Responses) |
| `eda_scr_amp_mean` | number | Mean SCR amplitude |

#### Respiratory Metrics
| Field | Type | Description |
|-------|------|-------------|
| `resp_rate` | number | Respiratory rate (breaths/min) |
| `resp_var` | number | Respiratory variability |

## Data Flow

```
User Input (21 fields)
        │
        ▼
┌───────────────────┐
│ Validation Layer │  (Client-side validation)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ API Client        │  (axios with interceptors)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ POST /api/v1/    │  (FastAPI endpoint)
│ inference/       │
│ predict          │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Backend Model     │  (ML model inference)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Response          │
└───────────────────┘
```

## API Endpoint

### Request

**Endpoint:** `POST /api/v1/inference/predict`

**Authentication:** Bearer token required

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "hr_mean": 75.0,
  "hr_std": 10.0,
  "hr_min": 60.0,
  "hr_max": 90.0,
  "rmssd_mean": 30.0,
  "rmssd_std": 5.0,
  "rmssd_min": 20.0,
  "rmssd_max": 40.0,
  "lf_hf_ratio": 1.5,
  "activity_steps": 100,
  "activity_calories": 50.0,
  "activity_level": 0.5,
  "temp_mean": 36.5,
  "temp_std": 0.2,
  "temp_range": 0.5,
  "eda_scl_mean": 3.5,
  "eda_scl_std": 0.03,
  "eda_scr_count": 5,
  "eda_scr_amp_mean": 0.02,
  "resp_rate": 15.0,
  "resp_var": 2.0
}
```

### Response

**Success Response (200):**
```json
{
  "inference_id": 1,
  "user_id": 1,
  "prediction": 0,
  "label": "non_stress",
  "probability": {
    "non_stress": 0.85,
    "stress": 0.15
  },
  "confidence": 0.85,
  "threshold": 0.5,
  "input_summary": {
    "hr_mean": 75.0,
    "rmssd_mean": 30.0,
    "lf_hf_ratio": 1.5
  }
}
```

**Error Response - Model Unavailable (503):**
```json
{
  "detail": "No model available for inference"
}
```

### Response Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `inference_id` | number | Unique identifier for this prediction |
| `user_id` | number | ID of the user who made the prediction |
| `prediction` | number | 0 for non_stress, 1 for stress (based on threshold) |
| `label` | string | Human-readable label ("stress" or "non_stress") |
| `probability` | object | Probability distribution |
| `probability.stress` | number | Probability of stress (0-1) |
| `probability.non_stress` | number | Probability of non-stress (0-1) |
| `confidence` | number | Model confidence in the prediction (0-1) |
| `threshold` | number | Decision threshold used (default 0.5) |
| `input_summary` | object | Summary of key input parameters |

## Client-Side Implementation

### Validation

All 21 fields are validated client-side before submission:

1. **Required fields** - All fields must be filled
2. **Numeric type** - All values must be convertible to numbers
3. **activity_level** - Must be between 0 and 1
4. **No NaN** - Values cannot be NaN

### API Client

The app uses an Axios client with the following features:

- **Base URL**: `http://localhost:8000/api/v1` (iOS) / `http://10.0.2.2:8000/api/v1` (Android)
- **Automatic token injection** - Bearer token added to Authorization header
- **Token refresh** - Automatic refresh on 401 responses
- **Error handling** - Centralized error parsing

### React Query Integration

The app uses TanStack Query for server state management:

- `useMutation` for submitting predictions
- Automatic error handling
- Loading states

## Screens

### StressPredictionScreen

The main screen for stress prediction:

1. **Form** - 21 input fields organized by category
2. **Validation** - Real-time error messages per field
3. **Submit** - Validates all fields, then calls API
4. **Result Display** - Shows:
   - Prediction label (Stress/Non-Stress)
   - Confidence percentage
   - Probability breakdown (stress vs non-stress)

### InferenceHistoryScreen

Displays past predictions:

- FlatList of inference records
- Pull-to-refresh support
- Shows date, label, confidence, and probabilities

### ReportScreen

Generates PDF reports:

- Optional date range selection
- Calls `/api/v1/reports/generate` endpoint
- Returns binary PDF data
- Supports sharing via expo-sharing

## Model Status

### Endpoint

**GET /api/v1/inference/model-status**

No authentication required.

**Response:**
```json
{
  "available": true,
  "model_name": "stress_model.pkl",
  "model_version": "1.0",
  "supported_formats": [".pkl", ".pickle", ".joblib", ".xgb", ".json"]
}
```

## Error Handling

| Status Code | Meaning | Handling |
|-------------|---------|----------|
| 400 | Invalid request | Show field-level errors |
| 401 | Unauthorized | Trigger token refresh |
| 403 | Forbidden | Show permission error |
| 404 | Not found | Show not found message |
| 503 | Model unavailable | Show "model unavailable" message |

## Testing the API

1. Start the FastAPI backend
2. Register/Login in the mobile app
3. Navigate to "Predict" tab
4. Fill in all 21 physiological parameters
5. Tap "Predict Stress"
6. View the result

## Future Improvements

1. **Sensor Integration** - Automatically collect data from wearable devices
2. **Real-time Monitoring** - Background data collection
3. **Model Updates** - Support for model versioning
4. **Offline Mode** - Local inference capability
