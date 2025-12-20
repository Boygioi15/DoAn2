# Speech-to-Text Module

## Overview
This module provides speech-to-text functionality using OpenAI Whisper API.

## Setup
1. Install OpenAI SDK (already done):
```bash
npm install openai
```

2. Add to `.env`:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

## API Endpoints

### POST /speech/to-text
Convert base64-encoded audio to text.

**Request:**
```json
{
  "audioData": "data:audio/webm;base64,...",
  "language": "vi-VN",
  "mimeType": "audio/webm"
}
```

**Response:**
```json
{
  "transcript": "transcribed text",
  "confidence": 1.0,
  "language": "vi-VN"
}
```

### POST /speech/upload
Upload audio file for transcription.

**Request:** multipart/form-data
- `audio`: Audio file
- `language`: Language code (optional, default: "vi-VN")

**Response:** Same as /speech/to-text

## Supported Audio Formats
- WebM (default from browser)
- MP3
- WAV
- M4A
- OGG

## Supported Languages
OpenAI Whisper supports 50+ languages including:
- Vietnamese (vi)
- English (en)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- And many more...

## Implementation Details

The service:
1. Receives base64-encoded audio
2. Converts to buffer
3. Saves temporarily to disk
4. Sends to OpenAI Whisper API
5. Returns transcription
6. Cleans up temporary file

## Error Handling
- Invalid audio format → 400 Bad Request
- Missing API key → 400 Bad Request
- Invalid API key → 400 Bad Request
- Rate limit exceeded → 400 Bad Request

## Cost
OpenAI Whisper API: $0.006 per minute of audio

## Testing
```bash
curl -X POST http://localhost:3000/speech/to-text \
  -H "Content-Type: application/json" \
  -d '{
    "audioData": "data:audio/webm;base64,...",
    "language": "vi-VN"
  }'
```

