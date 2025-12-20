import { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, X, Search } from 'lucide-react';
import './SpeechToTextDialog.css';
import { speechApi } from '@/api/speechApi';
import { toast } from 'sonner';

export function SpeechToTextDialog({ open, onOpenChange, onTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      stopRecording();
      setTranscript('');
      setIsProcessing(false);
    }
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Don't process here, wait for explicit call
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const stopAndSend = async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
      toast.error('Không có bản ghi âm');
      return;
    }

    // Stop recording
    mediaRecorderRef.current.stop();
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsRecording(false);

    // Wait a bit for the last data to be available
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create blob from chunks
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

    if (audioBlob.size === 0) {
      toast.error('Không có dữ liệu âm thanh');
      return;
    }

    // Send to backend
    await sendAudioToBackend(audioBlob);
  };

  const sendAudioToBackend = async (audioBlob) => {
    setIsProcessing(true);

    try {
      // Convert blob to base64
      const base64Audio = await blobToBase64(audioBlob);

      // Send to backend
      const response = await speechApi.speechToText({
        audioData: base64Audio,
        language: 'vi-VN',
        mimeType: 'audio/webm',
      });

      if (response.data && response.data.transcript) {
        setTranscript(response.data.transcript);
        toast.success('Đã chuyển đổi giọng nói thành công!');
      } else {
        toast.warning('Không nhận diện được giọng nói');
      }
    } catch (error) {
      console.error('Error sending audio to backend:', error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error('Lỗi: ' + errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleSearch = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
      onOpenChange(false);
    }
  };

  const handleClear = () => {
    setTranscript('');
    audioChunksRef.current = [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Tìm kiếm bằng giọng nói
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          {/* Microphone Icon with Animation */}
          <div className="relative">
            <div
              className={`
                w-28 h-28 rounded-full flex items-center justify-center cursor-pointer
                transition-all duration-300
                ${isRecording 
                  ? 'bg-red-500 speech-pulse-ring' 
                  : isProcessing 
                    ? 'bg-blue-500' 
                    : 'bg-gray-200 hover:bg-gray-300'}
              `}
              onClick={!isRecording && !isProcessing ? startRecording : undefined}
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent" />
              ) : isRecording ? (
                <Mic className="w-14 h-14 text-white animate-pulse" />
              ) : (
                <Mic className="w-14 h-14 text-gray-600" />
              )}
            </div>
            {isRecording && (
              <div className="absolute inset-0 rounded-full bg-red-500 opacity-25 speech-ping-ring" />
            )}
          </div>

          {/* Status Text */}
          <div className="text-center">
            {isProcessing ? (
              <p className="text-lg font-medium text-blue-600">
                Đang xử lý...
              </p>
            ) : isRecording ? (
              <p className="text-lg font-medium text-red-600">
                🔴 Đang ghi âm...
              </p>
            ) : transcript ? (
              <p className="text-lg font-medium text-green-600">
                ✅ Hoàn thành
              </p>
            ) : (
              <p className="text-lg font-medium text-gray-500">
                Nhấn vào micro để bắt đầu
              </p>
            )}
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="w-full min-h-[80px] p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-center text-lg text-gray-800">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3 flex-wrap justify-center">
            {!isRecording && !isProcessing && !transcript && (
              <Button
                onClick={startRecording}
                size="lg"
                className="bg-red-500 hover:bg-red-600"
              >
                <Mic className="w-5 h-5 mr-2" />
                Bắt đầu
              </Button>
            )}

            {isRecording && (
              <Button
                onClick={stopAndSend}
                size="lg"
                className="bg-green-500 hover:bg-green-600"
              >
                <MicOff className="w-5 h-5 mr-2" />
                Kết thúc
              </Button>
            )}

            {transcript && !isProcessing && (
              <>
                <Button
                  onClick={handleClear}
                  size="lg"
                  variant="outline"
                >
                  <X className="w-5 h-5 mr-2" />
                  Ghi lại
                </Button>
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Tìm kiếm
                </Button>
              </>
            )}
          </div>

          {/* Helper Text */}
          <p className="text-sm text-gray-500 text-center max-w-[350px]">
            {isRecording 
              ? 'Nói rõ ràng vào micro, sau đó nhấn "Kết thúc"'
              : 'Âm thanh sẽ được gửi đến server để nhận diện'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
