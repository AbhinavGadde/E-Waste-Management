# Environment Setup

## Google Gemini API Key

To use the e-waste image detection feature, you need to set the `GEMINI_API_KEY` environment variable.

### Local Development

1. Create a `.env` file in the `backend` directory:
   ```
   GOOGLE_API_KEY=<REPLACE_WITH_YOUR_ACTUAL_KEY>
   ```

2. Install dependencies (python-dotenv is already included in requirements.txt):
   ```bash
   pip install -r requirements.txt
   ```

   The backend automatically loads the `.env` file on startup.

### Production Deployment

Set the `GEMINI_API_KEY` environment variable in your deployment platform:
- **Railway**: Add it in the Variables tab
- **Render**: Add it in the Environment section
- **Other platforms**: Set it according to their documentation

### Optional Configuration

You can also set `GEMINI_MODEL_NAME` to override the default model:
```
GEMINI_MODEL_NAME=gemini-1.5-flash-001
```

