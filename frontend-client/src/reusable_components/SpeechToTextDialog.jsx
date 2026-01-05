import { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { speechApi } from '@/api/speechApi';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// States: 'idle' | 'recording' | 'processing' | 'succeeded' | 'failed'
const STATE = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
};

export function SpeechToTextDialog({ open, onOpenChange, onTranscript }) {
  const [state, setState] = useState(STATE.IDLE);
  const [transcript, setTranscript] = useState('');
  const [censoredWordList, setCensoredWordList] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      stopRecording();
      setTranscript('');
      setState(STATE.IDLE);
    }
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  //idle-> recording
  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
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
      setState(STATE.RECORDING);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error(
        'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.'
      );
      setState(STATE.FAILED);
    }
  };
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };
  //record->processing
  const stopAndSend = async () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state !== 'recording'
    ) {
      toast.error('Không có bản ghi âm');
      setState(STATE.IDLE);
      return;
    }

    // Stop recording
    mediaRecorderRef.current.stop();

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Wait a bit for the last data to be available
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create blob from chunks
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

    if (audioBlob.size === 0) {
      toast.error('Không có dữ liệu âm thanh');
      setState(STATE.FAILED);
      return;
    }

    // Send to backend
    await sendAudioToBackend(audioBlob);
  };

  const sendAudioToBackend = async (audioBlob) => {
    setState(STATE.PROCESSING);

    try {
      // Convert blob to base64
      const base64Audio = await blobToBase64(audioBlob);

      // Send to backend
      const response = await speechApi.speechToText({
        audioData: base64Audio,
        language: 'vi-VN',
        mimeType: 'audio/webm',
      });
      console.log(response);
      if (response.data) {
        setTranscript(response.data.correctedSentence);
        setCensoredWordList(response.data.censoredWordList);
        setState(STATE.SUCCEEDED);
        toast.success('Đã chuyển đổi giọng nói thành công!');
      } else {
        toast.warning('Không nhận diện được giọng nói');
        setState(STATE.FAILED);
      }
    } catch (error) {
      console.error('Error sending audio to backend:', error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error('Lỗi: ' + errorMessage);
      setState(STATE.FAILED);
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

  const handleRetry = () => {
    setTranscript('');
    audioChunksRef.current = [];
    setState(STATE.IDLE);
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
          <div className="relative flex items-center justify-center">
            <div
              className={`
                relative z-10 w-28 h-28 rounded-full flex items-center justify-center cursor-pointer
                transition-all duration-300
                ${state === STATE.RECORDING ? 'bg-red-500 animate-pulse' : ''}
                ${state === STATE.PROCESSING ? 'bg-blue-500' : ''}
                ${state === STATE.SUCCEEDED ? 'bg-green-500' : ''}
                ${state === STATE.FAILED ? 'bg-orange-500' : ''}
                ${state === STATE.IDLE ? 'bg-gray-200 hover:bg-gray-300' : ''}
              `}
              onClick={state === STATE.IDLE ? startRecording : undefined}
            >
              {state === STATE.PROCESSING ? (
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent" />
              ) : state === STATE.RECORDING ? (
                <Mic className="w-14 h-14 text-white animate-pulse" />
              ) : state === STATE.SUCCEEDED ? (
                <Mic className="w-14 h-14 text-white" />
              ) : state === STATE.FAILED ? (
                <X className="w-14 h-14 text-white" />
              ) : (
                <Mic className="w-14 h-14 text-gray-600" />
              )}
            </div>
            {state === STATE.RECORDING && (
              <div className="absolute inset-0 rounded-full bg-red-500 opacity-25 animate-ping" />
            )}
          </div>

          {/* Status Text */}
          <div className="text-center">
            {state === STATE.PROCESSING && (
              <p className="text-lg font-medium text-blue-600">Đang xử lý...</p>
            )}
            {state === STATE.RECORDING && (
              <p className="text-lg font-medium text-red-600">
                🔴 Đang ghi âm...
              </p>
            )}
            {state === STATE.SUCCEEDED && (
              <p className="text-lg font-medium text-green-600">
                ✅ Hoàn thành
              </p>
            )}
            {state === STATE.FAILED && (
              <p className="text-lg font-medium text-orange-600">❌ Thất bại</p>
            )}
            {state === STATE.IDLE && (
              <p className="text-lg font-medium text-gray-500">
                Nhấn vào micro để bắt đầu
              </p>
            )}
          </div>

          {/* Transcript Display */}
          {state === STATE.SUCCEEDED && (
            <div className="flex flex-col gap-2 w-full">
              <Textarea
                className="p-4 rounded-lg border border-gray-200 text-lg text-black"
                value={transcript}
                placeholder="Nhập tìm kiếm"
                onChange={(e) => setTranscript(e.target.value)}
              >
                {transcript}
              </Textarea>
              {censoredWordList && censoredWordList.length > 0 && (
                <Collapsible type="single">
                  <CollapsibleTrigger
                    className="text-center text-[13px] text-gray-500 group"
                    asChild
                  >
                    <Button
                      variant={'ghost'}
                      className={'p-2 text-red-500 hover:text-red-500/90'}
                    >
                      Các từ bị ẩn
                      <ChevronUp className="[[data-state=closed]>&]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {censoredWordList &&
                      censoredWordList.map((word, index) => (
                        <span className="flex gap-2 text-[13px] text-gray-500 pl-5 mb-1">
                          <span className="w-5">*{index + 1}:</span>
                          <span className="w-15">{word}</span>
                        </span>
                      ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              <span className="text-center text-[12px] text-gray-500">
                Nếu bạn thấy không chính xác, hãy chỉnh lại ở trên
              </span>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3 flex-wrap justify-center">
            {state === STATE.IDLE && (
              <Button
                onClick={startRecording}
                size="lg"
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Mic className="w-5 h-5 mr-2" />
                Bắt đầu
              </Button>
            )}

            {state === STATE.RECORDING && (
              <Button
                onClick={stopAndSend}
                size="lg"
                className="bg-green-500 hover:bg-green-600"
              >
                <MicOff className="w-5 h-5 mr-2" />
                Kết thúc
              </Button>
            )}

            {(state === STATE.SUCCEEDED || state === STATE.FAILED) && (
              <>
                <Button onClick={handleRetry} size="lg" variant="outline">
                  <X className="w-5 h-5 mr-2" />
                  Ghi lại
                </Button>
                {state === STATE.SUCCEEDED && (
                  <Button
                    onClick={handleSearch}
                    size="lg"
                    className="bg-red-500 hover:bg-red-500/80"
                    disabled={transcript.trim().length === 0}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Tìm kiếm
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Helper Text */}
          <p className="text-sm text-gray-500 text-center max-w-[350px]">
            {state === STATE.RECORDING
              ? 'Nói rõ ràng vào micro, sau đó nhấn "Kết thúc"'
              : 'Âm thanh sẽ được gửi đến server để nhận diện'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
