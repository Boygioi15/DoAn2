# Speech-to-Text Search Feature

## Overview
A YouTube-style speech-to-text dialog that allows users to search for products using their voice.

## Features
- 🎤 Voice recognition using Web Speech API
- 🇻🇳 Vietnamese language support (vi-VN)
- ✨ Real-time transcription display
- 🎨 Animated microphone with pulse effect
- 📝 Interim and final transcript handling
- 🔄 Start/Stop/Clear controls
- ✅ Automatic search navigation

## Components

### SpeechToTextDialog
Located at: `src/components/SpeechToTextDialog.jsx`

**Props:**
- `open` (boolean): Controls dialog visibility
- `onOpenChange` (function): Callback when dialog open state changes
- `onTranscript` (function): Callback with final transcript text

**Features:**
- Continuous speech recognition
- Real-time interim results
- Vietnamese language support
- Visual feedback with animated microphone
- Error handling

### Integration in RootLayout
The microphone button is integrated in the search bar:
- Click the microphone icon next to the search input
- Dialog opens and starts listening automatically
- Speak your search query in Vietnamese
- Click "Tìm kiếm" to search or "Dừng lại" to stop
- Transcript is automatically used for search navigation

## Browser Compatibility
Requires browsers that support Web Speech API:
- Chrome/Edge (recommended)
- Safari (with webkit prefix)
- Not supported in Firefox

## Usage Example

```jsx
import { SpeechToTextDialog } from '@/components/SpeechToTextDialog';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleTranscript = (text) => {
    console.log('Transcript:', text);
    // Do something with the transcript
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Voice Search
      </button>
      <SpeechToTextDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        onTranscript={handleTranscript}
      />
    </>
  );
}
```

## Styling
Custom animations are defined in `SpeechToTextDialog.css`:
- Pulse ring animation for active microphone
- Ping animation for visual feedback
- Smooth transitions

## Language Configuration
To change the language, modify the `recognition.lang` in SpeechToTextDialog.jsx:
```javascript
recognition.lang = 'vi-VN'; // Vietnamese
// Other options:
// recognition.lang = 'en-US'; // English
// recognition.lang = 'ja-JP'; // Japanese
```

## Troubleshooting

### Speech recognition not working
1. Ensure you're using a supported browser (Chrome/Edge recommended)
2. Check microphone permissions in browser settings
3. Verify HTTPS connection (required for Web Speech API)

### No transcript appearing
1. Speak clearly and at normal pace
2. Check microphone is not muted
3. Ensure correct language is selected

### Dialog not opening
1. Check browser console for errors
2. Verify @radix-ui/react-dialog is installed
3. Ensure Dialog component is properly imported

